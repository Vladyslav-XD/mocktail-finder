import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, ActionSheetIOS } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addRecipe, updateRecipe } from '../store/myRecipesSlice';
import { Badge } from '../components/Badge';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { spacing } from '../theme/spacing';
import { AddRecipeIcon, XIcon } from '../components/icons';
import { SCREENS } from '../constants/screens';
import { ALL_TAGS, DrinkTag, tagsToSubtitle } from '../utils/drinkTags';
import { pickRecipePhoto, takeRecipePhoto, persistRecipePhoto, deleteRecipePhoto, isRecipePhoto, resolveImageUri } from '../utils/recipePhotos';
import { splitInstructions } from '../utils/recipeText';
import { useFavorites } from '../context/FavoritesContext';
import { Recipe } from '../data/mockData';

/** Shown when the user adds no photo of their own. */
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop';
const MAX_TAGS = 3;

interface Ingredient {
  name: string;
  amount: string;
}

/** `stored` is a photo already in app storage (editing); `new` is a fresh pick, not copied yet. */
type Photo = { kind: 'stored'; ref: string } | { kind: 'new'; uri: string } | null;

type ParamList = {
  EditRecipe: { recipe?: Recipe } | undefined;
};

export const AddRecipeScreen = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const toast = useToast();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'EditRecipe'>>();
  const { updateFavorite } = useFavorites();
  /** Set when the screen was pushed from a recipe; the Add Recipe tab leaves it undefined. */
  const editing = route.params?.recipe;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [subtitle, setSubtitle] = useState(editing?.subtitle ?? '');
  const [tags, setTags] = useState<DrinkTag[]>((editing?.tags as DrinkTag[]) ?? []);
  // Since 1.2 a recipe keeps amount and name apart (`parts`), so they go back into their
  // own fields. An older recipe has only lines ("50 ml lime juice"); splitting one would
  // only guess wrong, so the whole line goes into the name field.
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    editing?.parts?.length
      ? editing.parts.map(p => ({ name: p.name, amount: p.amount }))
      : editing?.ingredients?.length
        ? editing.ingredients.map(line => ({ name: line, amount: '' }))
        : [{ name: '', amount: '' }]
  );
  const [steps, setSteps] = useState<string[]>(() => {
    const saved = splitInstructions(editing?.instructions);
    return saved.length ? saved : [''];
  });
  /** Only the user's own photo counts; the stock fallback image is not one. */
  const [photo, setPhoto] = useState<Photo>(
    editing && isRecipePhoto(editing.imageUrl) ? { kind: 'stored', ref: editing.imageUrl } : null
  );
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);

  const photoPreviewUri = photo ? (photo.kind === 'stored' ? resolveImageUri(photo.ref) : photo.uri) : null;

  const toggleTag = (tag: DrinkTag) => {
    setTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      if (prev.length >= MAX_TAGS) return prev; // silently ignore a fourth pick
      return [...prev, tag];
    });
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients(prev => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const runPicker = async (open: () => Promise<string | null>, failureTitle: string) => {
    if (picking) return; // a second tap while the picker is opening would orphan the first call
    setPicking(true);
    try {
      const uri = await open();
      if (uri) setPhoto({ kind: 'new', uri });
    } catch {
      Alert.alert(failureTitle, t('pleaseTryAgain'));
    } finally {
      setPicking(false);
    }
  };

  const handleAddPhoto = () => {
    if (picking) return;
    if (Platform.OS !== 'ios') {
      // Android has no action sheet here; the library is the only path this build needs.
      runPicker(pickRecipePhoto, t('photoLibraryError'));
      return;
    }
    ActionSheetIOS.showActionSheetWithOptions(
      { options: [t('takePhoto'), t('library'), t('cancel')], cancelButtonIndex: 2 },
      index => {
        if (index === 0) runPicker(() => takeRecipePhoto(t), t('cameraError'));
        if (index === 1) runPicker(pickRecipePhoto, t('photoLibraryError'));
      }
    );
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setTags([]);
    setIngredients([{ name: '', amount: '' }]);
    setSteps(['']);
    setPhoto(null);
  };

  const handleSaveRecipe = async () => {
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    const validSteps = steps.filter(s => s.trim() !== '');
    // Handoff: a name, an ingredient and a step, told in one toast.
    if (!title.trim() || validIngredients.length === 0 || validSteps.length === 0) {
      toast.show(t('formError'));
      return;
    }

    // Editing keeps the id, so the photo file name stays the same too.
    const id = editing ? editing.id : Date.now().toString();

    setSaving(true);
    let imageUrl = DEFAULT_IMAGE_URL;
    if (photo?.kind === 'stored') {
      imageUrl = photo.ref;
    } else if (photo?.kind === 'new') {
      try {
        imageUrl = await persistRecipePhoto(photo.uri, id);
      } catch {
        setSaving(false);
        Alert.alert(t('photoSaveErrorTitle'), t('photoSaveErrorText'));
        return;
      }
    } else if (editing && isRecipePhoto(editing.imageUrl)) {
      // The photo was removed in the form: drop the file, fall back to the stock image.
      await deleteRecipePhoto(editing.imageUrl);
    }

    const newRecipe = {
      id,
      title: title.trim(),
      subtitle: subtitle.trim() || tagsToSubtitle(tags),
      tags,
      imageUrl,
      isFavorite: editing?.isFavorite ?? false,
      ingredients: validIngredients.map(i => `${i.amount} ${i.name}`.trim()),
      parts: validIngredients.map(i => ({ amount: i.amount.trim(), name: i.name.trim() })),
      // Each step ends with its own punctuation, so the recipe screen splits the text back into the same steps.
      instructions: validSteps.map(s => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`)).join(' '),
      duration: editing?.duration ?? '5 min',
    };

    if (editing) {
      dispatch(updateRecipe(newRecipe));
      // A favourited copy would otherwise keep showing the old name and photo.
      updateFavorite(newRecipe);
      setSaving(false);
      // Straight back to the recipe, which reads the fresh version from the store.
      navigation.goBack();
      return;
    }

    dispatch(addRecipe(newRecipe));
    setSaving(false);
    resetForm();
    // Land on the list itself, not on whatever recipe was last open in the Home tab.
    navigation.navigate(SCREENS.HOME_TAB, { screen: SCREENS.MOCKTAIL_FINDER });
    toast.show(t('recipeSaved'));
  };

  const fieldStyle = { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={editing ? t('editTitle') : t('addTitle')}
        onBack={editing ? () => navigation.goBack() : undefined}
      />

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>{t('photoOpt')}</Text>
          {photoPreviewUri ? (
            <View>
              <Image source={{ uri: photoPreviewUri }} style={[styles.photoPreview, { borderColor: colors.badgeBorder }]} />
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                  onPress={handleAddPhoto}
                  accessibilityRole="button"
                >
                  <Text style={[styles.photoActionText, { color: colors.title }]}>{t('changePhoto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                  onPress={() => setPhoto(null)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.photoActionText, { color: colors.title }]}>{t('removePhoto')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
              onPress={handleAddPhoto}
              accessibilityRole="button"
            >
              <AddRecipeIcon size={18} color={colors.title} />
              <Text style={[styles.addButtonText, { color: colors.title }]}>{t('addPhoto')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>{t('recipeName')} *</Text>
          <TextInput
            style={[styles.input, fieldStyle]}
            placeholder={t('namePh')}
            placeholderTextColor={colors.subtitle}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>{t('shortDesc')}</Text>
          <TextInput
            style={[styles.input, fieldStyle]}
            placeholder={t('descPh')}
            placeholderTextColor={colors.subtitle}
            value={subtitle}
            onChangeText={setSubtitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>{t('character')}</Text>
          {/* Wrapped, not scrolled: every option visible, nothing clipped at the edge. */}
          <View style={styles.wrapList}>
            {ALL_TAGS.map(tag => (
              <Badge
                key={tag}
                label={t(`tag.${tag}`)}
                active={tags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>{t('ingredients')} *</Text>
          {ingredients.map((ing, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientNameInput, fieldStyle]}
                placeholder={t('ingredient')}
                placeholderTextColor={colors.subtitle}
                value={ing.name}
                onChangeText={(val) => handleIngredientChange(index, 'name', val)}
              />
              <TextInput
                style={[styles.input, styles.ingredientAmountInput, fieldStyle]}
                placeholder={t('amount')}
                placeholderTextColor={colors.subtitle}
                value={ing.amount}
                onChangeText={(val) => handleIngredientChange(index, 'amount', val)}
              />
              <TouchableOpacity
                style={[styles.removeButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                onPress={() => handleRemoveIngredient(index)}
                accessibilityRole="button"
                accessibilityLabel={t('a11yRemove', { name: ing.name.trim() || t('ingredient') })}
              >
                <XIcon size={16} color={colors.title} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
            onPress={handleAddIngredient}
          >
            <AddRecipeIcon size={18} color={colors.title} />
            <Text style={[styles.addButtonText, { color: colors.title }]}>{t('addIng')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>{t('prepSteps')}</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepCircle, { backgroundColor: colors.activeBadgeBG }]}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.stepInput, fieldStyle]}
                placeholder={`${t('step')} ${index + 1}`}
                placeholderTextColor={colors.subtitle}
                value={step}
                onChangeText={(val) => handleStepChange(index, val)}
                multiline
              />
              <TouchableOpacity
                style={[styles.removeButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface, marginLeft: spacing.s, marginTop: 2 }]}
                onPress={() => handleRemoveStep(index)}
                accessibilityRole="button"
                accessibilityLabel={t('a11yRemove', { name: `${t('step')} ${index + 1}` })}
              >
                <XIcon size={16} color={colors.title} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
            onPress={handleAddStep}
          >
            <AddRecipeIcon size={18} color={colors.title} />
            <Text style={[styles.addButtonText, { color: colors.title }]}>{t('addStep')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.activeBadgeBG, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSaveRecipe}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? t('saving') : editing ? t('saveChanges') : t('save')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    // no hardcoded background: the screen container paints colors.background (light or dark)
  },
  scrollContent: {
    paddingBottom: 60,
  },
  inputGroup: {
    marginBottom: spacing.l,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  wrapList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#0B0F14',
  },
  photoActions: {
    flexDirection: 'row',
    marginTop: spacing.s,
  },
  photoActionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: spacing.s,
  },
  photoActionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
    alignItems: 'center',
  },
  ingredientNameInput: {
    flex: 2,
    marginRight: spacing.s,
  },
  ingredientAmountInput: {
    flex: 1,
    marginRight: spacing.s,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: spacing.s,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    marginTop: 8,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepInput: {
    flex: 1,
    minHeight: 48,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.xl,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
