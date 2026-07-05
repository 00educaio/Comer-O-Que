import { Image } from 'expo-image';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  View,
} from 'react-native';

import { getFoodImageUrl } from '@/lib/foodImages';
import { colors } from '@/theme/theme';
import type { Food } from '@/types/catalog';

type FoodArtworkProps = {
  containerStyle?: StyleProp<ViewStyle>;
  fallbackTextStyle?: StyleProp<TextStyle>;
  food: Pick<Food, 'name' | 'assetKey' | 'emoji'>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function FoodArtwork({
  containerStyle,
  fallbackTextStyle,
  food,
  imageStyle,
}: FoodArtworkProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = getFoodImageUrl(food);
  const hasError = imageUrl != null && failedImageUrl === imageUrl;

  if (!imageUrl || hasError) {
    return (
      <View style={[styles.fallbackContainer, containerStyle]}>
        <Text style={[styles.fallbackText, fallbackTextStyle]}>
          {food.emoji ?? '🍽️'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.imageContainer, containerStyle]}>
      <Image
        accessible={false}
        contentFit="cover"
        onError={() => setFailedImageUrl(imageUrl)}
        source={{ uri: imageUrl }}
        style={[styles.image, imageStyle]}
        transition={140}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackText: {
    color: colors.text,
    fontSize: 42,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.cardBorderSoft,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.surfaceTranslucent,
    height: '100%',
    width: '100%',
  },
});
