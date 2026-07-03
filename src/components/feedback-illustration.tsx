import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { radius } from '@/theme/theme';

const loadingFrames = [
  require('../../assets/images/ComerOQue/state-loading-1.png'),
  require('../../assets/images/ComerOQue/state-loading-2.png'),
  require('../../assets/images/ComerOQue/state-loading-3.png'),
  require('../../assets/images/ComerOQue/state-loading-4.png'),
] as const;

const errorIllustration = require('../../assets/images/ComerOQue/state-error.png');

export function LoadingIllustration() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((currentFrame) => (currentFrame + 1) % loadingFrames.length);
    }, 260);

    return () => clearInterval(timer);
  }, []);

  return (
    <Image
      accessible={false}
      contentFit="cover"
      source={loadingFrames[frameIndex]}
      style={styles.image}
      transition={80}
    />
  );
}

export function ErrorIllustration() {
  return (
    <Image
      accessible={false}
      contentFit="cover"
      source={errorIllustration}
      style={styles.image}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    aspectRatio: 1,
    borderRadius: radius.md,
    maxWidth: 240,
    width: '100%',
  },
});
