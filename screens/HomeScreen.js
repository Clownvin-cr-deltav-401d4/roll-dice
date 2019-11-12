import React, { useState, useEffect } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Slider,
} from 'react-native';

import { Accelerometer } from 'expo-sensors';
import { useKeepAwake } from 'expo-keep-awake';

const WAITING = 'Waiting for rolling motion...', ROLLING = 'Rolling...';

export default function HomeScreen() {
  useKeepAwake();

  let [dice, setDice] = useState(Array(100).fill(1));
  let [state, setState] = useState(WAITING);
  let [sides, setSides] = useState(6);
  let [numDice, setNumDice] = useState(1);
  let [sensorData, setSensorData] = useState({
    available: true,
    x: 0,
    y: 0,
    z: 1,
    velocity: 0,
  });

  const getRoll = () => {
    return Math.floor(Math.random() * (sides - 1)) + 1;
  }

  let subscription;

  const changeSides = sides => {
    setSides(Math.round(sides));
  }

  const changeNumDice = num => {
    setNumDice(Math.round(num));
  }

  const changeSensorData = data => {
    setSensorData(sensorData => ({
      ...sensorData, 
      velocity: (Math.abs(sensorData.x - data.x) + Math.abs(sensorData.y - data.y) + Math.abs(sensorData.z - data.z)) / 3,
      ...data}));
  }

  useEffect(() => {
    Accelerometer.isAvailableAsync().then(available => {
      if (available) {
        Accelerometer.setUpdateInterval(100);
        setSensorData({...sensorData, available: true});
        subscription = Accelerometer.addListener(changeSensorData);
      } else {
        setSensorData({...sensorData, available: false});
      }
    });
  }, []);

  const getDice = () => {
    //comment to make pull request.
    let diceComponents = [];
    for (let i = 0; i < numDice; i++) {
      diceComponents.push(<Text key={i} style={styles.die}>{state === WAITING ? dice[i] : getRoll()}</Text>);
    }
    return diceComponents;
  };

  if (sensorData.velocity > 1.2 && state !== ROLLING) {
    setState(ROLLING);
  }

  if (sensorData.velocity < 1.2 && state !== WAITING) {
    setState(WAITING);
    setDice(dice => dice.map((die, index) => index < numDice ? Math.round(Math.random() * (sides - 1)) + 1 : die));
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <Text style={styles.getStartedText}>Shake to roll {numDice} {sides} sided dice...</Text>
        <Slider onValueChange={changeSides} value={sides} minimumValue={2} maximumValue={20}></Slider>
        <Slider onValueChange={changeNumDice} value={numDice} minimumValue={1} maximumValue={100}></Slider>
        <Text style={styles.getStartedtext}>Velocity: {sensorData.velocity}</Text>
        <Text style={styles.getStartedtext}>State: {state}</Text>
        <ScrollView
          style={styles.diceContainer}
          contentContainerStyle={styles.contentContainer}>
          {getDice()}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  diceContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  die: {
    borderWidth: 2,
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 5,
    borderColor: '#222',
    textAlign: 'center',
    fontSize: 60,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
