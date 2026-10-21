import { useRouter } from 'expo-router';
import { Info, Sparkle } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { RUNOFF_COEFFICIENT } from '@/data/calculations/constants';
import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { RoofMaterial } from '@/data/store/projectTypes';
import AerialRoof from '@/shared/components/AerialRoof';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Chip, Segmented } from '@/shared/components/Controls';
import { Notice } from '@/shared/components/Notice';
import { colors, fonts } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import MaterialDetectionCard from '../components/MaterialDetectionCard';
import SetupScaffold from '../components/SetupScaffold';
import { useRoofMaterialDetection } from '../hooks/useRoofMaterialDetection';

const MATERIALS: RoofMaterial[] = ['tiles', 'slate', 'metal', 'flat', 'green', 'thatched'];
const DRAINED_SHARES = [1, 0.75, 0.5];

export default function RoofScreen() {
  const router = useRouter();
  const { s, fill, number } = useI18n();
  const { project } = useProjectStore();
  const { updateRoof } = useProjectActions();
  const { roof, building } = project;
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [areaText, setAreaText] = useState(String(Math.round(roof.areaM2)));

  const detection = useRoofMaterialDetection();

  const saveArea = () => {
    const value = Number(areaText.replace(',', '.'));
    if (Number.isFinite(value) && value > 0) {
      updateRoof({ areaM2: value });
    } else {
      setAreaText(String(Math.round(roof.areaM2)));
    }
    setIsEditingArea(false);
  };

  const runoff = RUNOFF_COEFFICIENT[roof.material];
  const sourceBadge =
    roof.materialSource === 'model' && roof.materialConfidence !== null
      ? fill(s.roof.detected, { value: Math.round(roof.materialConfidence * 100) })
      : roof.materialSource === 'ign'
        ? s.roof.fromIgn
        : null;

  return (
    <SetupScaffold
      title={s.roof.title}
      step={1}
      actionLabel={s.roof.confirm}
      onAction={() => router.push('/setup/home')}
    >
      {building ? <AerialRoof outline={building.outline} height={200} /> : null}

      <Card style={styles.section}>
        <View style={styles.row}>
          <AppText variant="label" style={styles.flex}>
            {s.roof.area}
          </AppText>
          <Pressable
            onPress={() => (isEditingArea ? saveArea() : setIsEditingArea(true))}
            hitSlop={8}
            accessibilityRole="button"
          >
            <AppText style={styles.link}>
              {isEditingArea ? s.common.continue : s.common.edit}
            </AppText>
          </Pressable>
        </View>
        {isEditingArea ? (
          <View style={styles.row}>
            <TextInput
              value={areaText}
              onChangeText={setAreaText}
              onSubmitEditing={saveArea}
              keyboardType="decimal-pad"
              autoFocus
              style={styles.areaInput}
              accessibilityLabel={s.roof.area}
            />
            <AppText variant="number">m²</AppText>
          </View>
        ) : (
          <AppText variant="number">{number(roof.areaM2)} m²</AppText>
        )}
        <AppText variant="caption">{s.roof.areaHint}</AppText>
      </Card>

      <Card style={styles.section}>
        <AppText variant="label">{s.roof.drained}</AppText>
        <Segmented
          options={DRAINED_SHARES.map((share) => ({ value: share, label: `${share * 100}%` }))}
          value={roof.drainedShare}
          onChange={(drainedShare) => updateRoof({ drainedShare })}
        />
        <AppText variant="caption">{s.roof.drainedHint}</AppText>
      </Card>

      <Card style={styles.section}>
        <View style={styles.row}>
          <AppText variant="label" style={styles.flex}>
            {s.roof.material}
          </AppText>
          {sourceBadge ? (
            <View style={styles.badge}>
              <Sparkle size={14} weight="fill" color={colors.green} />
              <AppText style={styles.badgeText}>{sourceBadge}</AppText>
            </View>
          ) : null}
        </View>
        <View style={styles.chips}>
          {MATERIALS.map((material) => (
            <Chip
              key={material}
              label={s.roof.materials[material]}
              isSelected={roof.material === material}
              onPress={() =>
                updateRoof({ material, materialSource: 'user', materialConfidence: null })
              }
            />
          ))}
        </View>
        <View style={styles.row}>
          <Info size={16} color={colors.secondaryText} />
          <AppText variant="caption" style={styles.flex}>
            {fill(s.roof.runoffHint, {
              material: s.roof.materials[roof.material],
              value: Math.round(runoff * 100),
            })}
          </AppText>
        </View>
      </Card>

      <MaterialDetectionCard state={detection.state} onUse={detection.applySuggestion} />

      {roof.material === 'thatched' ? (
        <Notice tone="warning" text={s.roof.thatchedWarning} />
      ) : null}
    </SetupScaffold>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  link: {
    fontFamily: fonts.semibold,
    color: colors.buttons,
  },
  areaInput: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.primaryText,
    borderBottomWidth: 2,
    borderBottomColor: colors.teal,
    paddingVertical: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.green,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
