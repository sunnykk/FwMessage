/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TouchableOpacity,
  TextInput,
  PermissionsAndroid
} from 'react-native';
import * as ReadSms from 'react-native-read-sms/ReadSms';
import SmsAndroid from 'react-native-get-sms-android';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';
import dayjs from 'dayjs';
import RNExitApp from 'react-native-exit-app';
//import messaging from '@react-native-firebase/messaging';


class ReadSMSComponent extends React.Component {
 
  constructor(props) {
      super(props);
      this.state = {
        sendSMSList : [],
        isModalVisible : false,
        setCallNumber: '',
        setKeyword: '',
        firstSetting: false,
        keySet : {
          keyword : null,
          phoneNumbers : [],
        },
        permissionsStatus : 'SMS 권한 확인 중',
      }
  }

  created = () =>{
    console.log('created()');
    //this.requestSendSMSPermission();
  }

  componentDidMount = () =>{
    console.log('componentDidMount()');
    //this.checkStorage();
    this.requestSendSMSPermission();
    let now = dayjs().format('YYYY.MM.DD HH:mm');
    console.log(now)
  }

 checkStorage = async () => {
    try {
      const keySet = JSON.parse(await AsyncStorage.getItem('keySet'));
      console.log('checkStorage keySet - '+ JSON.stringify(keySet));
      if(keySet !== null) {
        this.setState({
          keySet: keySet,
          firstSetting : true
        });
        // sms reading 시작
        this.startReadSMS();
      }else{
        this.setState({
          isModalVisible: true
        });
      }
    } catch (error) {
      console.error('AsyncStorage.getItem : ' + error);
    }
  }
  
  startReadSMS = async () => {
    console.log('startReadSMS()');
      const hasPermission = await ReadSms.requestReadSMSPermission();
      if(hasPermission) {
          this.setState({
            permissionsStatus: ''
          });
          ReadSms.startReadSMS((status, sms, error) => {
              if (status == "success") {
                  console.log("Great!! you have received new sms:", sms);
                  const keySet = this.state.keySet;
                  const phoneNumbers = {
                    "addressList": keySet.phoneNumbers
                  };
                  const message = '[전달드려요^-^]'+sms;
                  const keyword = keySet.keyword;
                  if(sms.includes(keyword) && !sms.includes('[전달드려요^-^]')){ // 보내기
                    SmsAndroid.autoSend(
                        JSON.stringify(phoneNumbers),
                        message,
                        (fail) => {
                            console.log('Failed with this error: ' + fail);
                        },
                        (success) => {
                            console.log('SMS sent successfully');
                            let now = dayjs().format('YYYY.MM.DD HH:mm');
                            this.setState({
                              sendSMSList: this.state.sendSMSList.concat('['+now+'] '+sms)
                            });
                        },
                    );
                  }
              }else{
                console.log('status : '+status+' , error'+error);
              }
          });
      }else{
        console.log('권한없음');
        alert('앱 재시작 부탁드립니다.');
        this.setState({
          permissionsStatus: '앱 재시작 부탁드립니다.'
        });
      }
  }

  requestSendSMSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: "[필수]SMS 권한 허용",
          message:
            "해당 앱의 기능을 사용하시려면 SMS 권한 허용이 필요합니다.",
          buttonNegative: "취소",
          buttonPositive: "확인"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use sms");
        this.checkStorage();
      } else {
        console.log("sms permission denied");
        alert('해당 앱 sms 권한을 허용해주세요.');
        this.setState({
          permissionsStatus: 'SMS 권한 거부'
        });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  toggleModal = () => {
    this.setState({
      isModalVisible: !this.state.isModalVisible,
      setCallNumber : '',
      setKeyword : ''
    });
  };

  handleCallNumber = text => {
    this.setState({ setCallNumber: text });
  };
 
  handleKeyword = text => {
    this.setState({ setKeyword: text });
  };

  setData = (keyword,cellNumber)=>{
    let alertTxt = '';
    let keySet = this.state.keySet;
    console.log('setData() - 저장 전 >'+JSON.stringify(keySet));
    if(keyword != ''){
      keySet.keyword = keyword;
      alertTxt += "change keyword :" + keyword;
    }
    if(cellNumber != ''){
      keySet.phoneNumbers = keySet.phoneNumbers.concat(cellNumber);
      alertTxt += "\t add cellNumber :" + cellNumber;
    }
    console.log('setData() - keySet >'+JSON.stringify(keySet));
    this.setState({
      keySet: keySet,
      isModalVisible: !this.state.isModalVisible
    });

    const tt = JSON.stringify(this.state.keySet);
    try {
      AsyncStorage.setItem('keySet', tt);
    }catch(error){
      console.error('AsyncStorage.setItem : ' + error);
    }

    if(!this.state.firstSetting){
      //this.startReadSMS();
      this.setState({
        firstSetting : true
      });
    }

    //문자 읽기 시작!
    alert(alertTxt);
  }
 
  setSetting = (keyword,cellNumber) => {
    if(cellNumber==''&& keyword == ''){
      if(this.state.keySet.phoneNumbers.length == 0){
        alert('need 1 set.');
      }else{
        this.setState({
          isModalVisible: !this.state.isModalVisible
        });
      }
    }else{
      this.setData(keyword,cellNumber);
    }
  }

  handleRemove = id => {
    console.log(JSON.stringify(id));
    let keySet = this.state.keySet;
    let phoneNumbers = keySet.phoneNumbers.filter(item => item !== id);
    console.log(JSON.stringify(phoneNumbers)+phoneNumbers.length);
    if(phoneNumbers.length == 0){
      alert('한개 이상!');
      return;
    }
    keySet.phoneNumbers = phoneNumbers;
    this.setState({
      keySet: keySet,
    });

    try {
      AsyncStorage.setItem('keySet', JSON.stringify(keySet));
    }catch(error){
      console.error('AsyncStorage.setItem : ' + error);
    }
  }

  componentWillUnmount = () => {
    ReadSms.stopReadSMS();
  }

  render() {
  const itemList = (this.state.sendSMSList).map((item,idx) => (
      <View key={idx} style={styles.sendTxtList}>
         <Image
              style={styles.sendTxtIcon}
              source={require('./images/sms.png')}
          />
          <View>
            <Text style={styles.sendTxt}>{item}</Text>
          </View>
        </View>
      ));

  const cellNumberList = (this.state.keySet.phoneNumbers).map((item,idx) => (
    <View key={idx} style={{flexDirection: 'row'}}>
      <Text>{item}</Text>
      <Button onPress={() => this.handleRemove(item)} title="X"></Button>
    </View>
    ));
    return <View>
              <Modal isVisible={this.state.isModalVisible}>
                <View style={styles.container}>
                  <View>
                    <Text style={{textAlign: 'center'}}>설정 내역</Text>
                    <View style={{flexDirection: 'row', padding:5}}>
                      <Text style={{padding:5}} >{this.state.keySet.keyword}</Text>
                      <View style={{padding:5}}>{cellNumberList}</View>
                    </View>
                  </View>
                  <View>
                    <TextInput
                      style={styles.input}
                      underlineColorAndroid="transparent"
                      placeholder="전달할 문자의 키워드"
                      placeholderTextColor="skyblue"
                      autoCapitalize="none"
                      onChangeText={this.handleKeyword}
                    />
                    <TextInput
                      style={styles.input}
                      underlineColorAndroid="transparent"
                      placeholder="ex)01012345678"
                      placeholderTextColor="skyblue"
                      autoCapitalize="none"
                      onChangeText={this.handleCallNumber}
                    />
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={() => this.setSetting(this.state.setKeyword,this.state.setCallNumber)}
                    >
                      <Text style={styles.submitButtonText}>setting</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                <View style={styles.title}>
                    <Text style={{ fontSize: 20,justifyContent: 'center', textAlign: 'center', marginTop: 5, fontWeight: 'bold'}}>전달된 문자 내역</Text>
                </View>
                <Button style={styles.settingBtn} title="setting" onPress={() => this.toggleModal(true)}>
                </Button>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <Text style={{ fontSize: 10,justifyContent: 'center', textAlign: 'center', marginTop: 5, fontWeight: 'bold'}}>{this.state.permissionsStatus}</Text>
              </View>
              {itemList}
          </View>
  }
}


export default function App() {

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     alert('A new FCM message arrived!'+JSON.stringify(remoteMessage));
  //     console.log('열려있당!', remoteMessage);
  //   });

  //   return unsubscribe;
  // }, []);

  return (
    <ReadSMSComponent></ReadSMSComponent>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection:'row',
    alignItems:'center',
    padding : 5,
  },
  settingBtn: {
    flexDirection:'row',
    alignItems:'flex-end',
    margin : 5,
  },
  sendTxtList: {
    flexDirection: 'row',
    padding:5,
  },
  sendTxtIcon: {
    width:50,
    height:50,
    margin:10,
  },
  sendTxt: {
    fontSize: 20, 
    textAlign:'center',
    paddingVertical:20
  },
  modalSt: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor : 'white',
    padding: 50
  },
  container: {
    paddingTop: 23,
    backgroundColor : 'white',
  },
  input: {
    margin: 15,
    height: 40,
    borderColor: "skyblue",
    borderWidth: 1
  },
  submitButton: {
    backgroundColor: "skyblue",
    padding: 10,
    margin: 15,
    height: 40
  },
  submitButtonText: {
    color: "white",
    textAlign: 'center'
  }
});
