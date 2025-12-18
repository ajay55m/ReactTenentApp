// src/CloudErrorConnection.jsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CloudErrorConnection({ 
  onPress, 
  onNavigate, 
  onToggleNotifications, 
  unreadCount = 0,
  onRetry 
}) {
  // Animation values
  const cloudPulseAnim = useRef(new Animated.Value(1)).current;
  const xScaleAnim = useRef(new Animated.Value(0)).current;
  const cloudFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cloud floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudFloatAnim, {
          toValue: -5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cloudFloatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Cloud pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudPulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cloudPulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // X mark drawing animation
    Animated.timing(xScaleAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
      delay: 500,
    }).start();

    floatAnimation.start();
    pulseAnimation.start();

    return () => {
      floatAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.container}>
        {/* Use existing Header component */}
        <Header 
          onPress={onPress}
          onNavigate={onNavigate}
          onToggleNotifications={onToggleNotifications}
          unreadCount={unreadCount}
        />

        {/* Main Error Content */}
        <View style={styles.errorContent}>
          {/* Animated Cloud Error Icon */}
          <Animated.View 
            style={[
              styles.cloudErrorIcon,
              {
                transform: [
                  { scale: cloudPulseAnim },
                  { translateY: cloudFloatAnim }
                ]
              }
            ]}
          >
            {/* Cloud Body */}
            <View style={styles.cloudBody}>
              <View style={styles.cloudMain} />
              <View style={styles.cloudBump1} />
              <View style={styles.cloudBump2} />
              <View style={styles.cloudBump3} />
            </View>

            {/* Animated X Mark */}
            <View style={styles.errorXContainer}>
              <Animated.View 
                style={[
                  styles.xLine,
                  styles.xLine1,
                  {
                    transform: [
                      { scaleX: xScaleAnim },
                      { rotate: '45deg' }
                    ]
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.xLine,
                  styles.xLine2,
                  {
                    transform: [
                      { scaleX: xScaleAnim },
                      { rotate: '-45deg' }
                    ]
                  }
                ]} 
              />
            </View>

            {/* Lightning Bolt */}
            <View style={styles.lightningBolt}>
              <View style={styles.lightningMain} />
              <View style={styles.lightningTip} />
            </View>
          </Animated.View>

          <Text style={styles.errorTitle}>Oops! Something Went Wrong</Text>
          <Text style={styles.errorMessage}>
            Poor internet connection.
            Please check your connection and try again.
          </Text>
          
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Use existing Footer component */}
        <Footer onPress={onPress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  // Animated Cloud Error Icon
  cloudErrorIcon: {
    width: 140,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  cloudBody: {
    width: 100,
    height: 70,
    position: 'relative',
  },
  cloudMain: {
    position: 'absolute',
    top: 15,
    left: 10,
    width: 80,
    height: 45,
    backgroundColor: '#94A3B8',
    borderRadius: 40,
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cloudBump1: {
    position: 'absolute',
    top: 5,
    left: 20,
    width: 35,
    height: 35,
    backgroundColor: '#94A3B8',
    borderRadius: 20,
    opacity: 0.8,
  },
  cloudBump2: {
    position: 'absolute',
    top: 0,
    left: 45,
    width: 30,
    height: 30,
    backgroundColor: '#94A3B8',
    borderRadius: 15,
    opacity: 0.7,
  },
  cloudBump3: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 25,
    height: 25,
    backgroundColor: '#94A3B8',
    borderRadius: 12.5,
    opacity: 0.6,
  },
  errorXContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 50,
    height: 50,
    marginLeft: -25,
    marginTop: -25,
    zIndex: 2,
  },
  xLine: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 6,
    backgroundColor: '#EF4444',
    borderRadius: 3,
    marginLeft: -20,
    marginTop: -3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  xLine1: {
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    transform: [{ rotate: '-45deg' }],
  },
  lightningBolt: {
    position: 'absolute',
    top: 25,
    right: 20,
    width: 15,
    height: 20,
    zIndex: 1,
  },
  lightningMain: {
    position: 'absolute',
    top: 0,
    left: 5,
    width: 5,
    height: 12,
    backgroundColor: '#F59E0B',
    transform: [{ skewX: '-10deg' }],
    borderRadius: 1,
  },
  lightningTip: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 8,
    height: 8,
    backgroundColor: '#F59E0B',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  },
  errorTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  errorMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
    letterSpacing: 0.2,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 160,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});