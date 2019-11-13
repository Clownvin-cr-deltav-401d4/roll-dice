import React, { useState, useEffect } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Slider,
} from 'react-native';
import Swiper from 'react-native-swiper';

import { Accelerometer } from 'expo-sensors';
import { useKeepAwake } from 'expo-keep-awake';

const WAITING = 'Waiting for rolling motion...', ROLLING = 'Rolling...';
const UNICODE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export default function HomeScreen() {
  useKeepAwake();

  let [dice, setDice] = useState(Array(50).fill(1));
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
  let [history, setHistory] = useState([]);

  const getRoll = () => {
    return Math.floor(Math.random() * sides) + 1;
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

  const getDiceText = number => sides <= 6 ? UNICODE_FACES[number - 1] : number;

  const diceTotal = (dice = dice) => dice.reduce((total, value, index) => index < numDice ? total + value : total, 0);

  const getDice = () => {
    //comment to make pull request.
    let diceComponents = [];
    for (let i = 0; i < numDice; i++) {
      diceComponents.push(<Text key={i} style={sides < 7 ? styles.die : styles.dieNumber }>{getDiceText(state === WAITING ? dice[i] : getRoll())}</Text>);
    }
    return diceComponents;
  };

  const getHistory = () => {
    return history.reduce((history, roll, index) => {
      history.push(
        <View key={index}>
          <Text style={styles.getStartedText}>Rolled {NUMBERS[roll.count - 1]} {roll.sides} sided {roll.count > 1 ? 'dice' : 'die'}</Text>
          <Text style={styles.getStartedText}>Total: {roll.total}</Text>
        </View>
      );
      return history;
    }, []);
  }

  const addHistory = () => {
    setHistory(history => [{count: numDice, sides: sides, total: diceTotal()}, ...history].slice(0, 5));
  };

  if (sensorData.velocity > 1.2 && state !== ROLLING) {
    setState(ROLLING);
  }

  if (sensorData.velocity < 1.2 && state !== WAITING) {
    setState(WAITING);
    setDice(dice => dice.map((die, index) => index < numDice ? getRoll() : die));
    addHistory();
  }

  return (
    <Swiper style={{}} showButtons={true}>
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
            <Text style={styles.getStartedText}>Configuration</Text>
          <Text style={styles.getStartedText}>Number of sides: {sides}</Text>
          <Slider style={styles.slider} onValueChange={changeSides} value={sides} minimumValue={2} maximumValue={20}></Slider>
          <Text style={styles.getStartedText}>Number of dice: {numDice}</Text>
          <Slider style={styles.slider} onValueChange={changeNumDice} value={numDice} minimumValue={1} maximumValue={12}></Slider>
        </ScrollView>
      </View>
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.getStartedText}>Shake to roll...</Text>
          <View
            style={styles.diceContainer}
            contentContainerStyle={styles.contentContainer}>
            {getDice()}
          </View>
  <Text style={styles.getStartedText}>Total: {state === ROLLING ? '...' : diceTotal()}</Text>
        </ScrollView>
      </View>
      <View style={styles.container}>
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}>
            <Text style={styles.getStartedText}>History</Text>
            {getHistory()}
        </ScrollView>
      </View>
    </Swiper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slider: {
    //transform: [{scaleX: 1}, {scaleY: 1.5}],
  },
  statusMessage: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  diceContainer: {
    textAlign: 'center',
    alignContent: "center",
    justifyContent: "space-evenly",
    margin: 10,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexGrow: 10,
  },
  dieNumber: {
    width: 80,
    height: 80,
    borderRadius: 5,
    borderWidth: 2,
    marginBottom: 10,
    borderColor: '#222',
    textAlign: 'center',
    fontSize: 50,
    lineHeight: 80,
  },
  die: {
    width: 80,
    height: 80,
    borderRadius: 5,
    borderColor: '#222',
    textAlign: 'center',
    fontSize: 75,
    lineHeight: 80,
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
    fontSize: 30,
    height: 50,
    color: '#888',
    lineHeight: 50,
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
