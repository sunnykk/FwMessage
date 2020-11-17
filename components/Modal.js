import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from "react-native";
import Modal from 'react-native-modal';
 
class Inputs extends Component {
  state = {
    callNumber: "",
    keyword: ""
  };
 
  handleCallNumber = text => {
    this.setState({ email: text });
  };
 
  handleKeyword = text => {
    this.setState({ keyword: text });
  };
 
  login = (email, keyword) => {
    alert("email :" + email + "keyword :" + keyword);
  };
 
  render() {
    return (
      <Modal style={styles.container}>
        <TextInput
          style={styles.input}
          underlineColorAndroid="transparent"
          placeholder="callNumber"
          placeholderTextColor="#9a73ef"
          autoCapitalize="none"
          onChangeText={this.handleCallNumber}
        />
        <TextInput
          style={styles.input}
          underlineColorAndroid="transparent"
          placeholder="keyword"
          placeholderTextColor="#9a73ef"
          autoCapitalize="none"
          onChangeText={this.handleKeyword}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => this.login(this.state.callNumber, this.state.keyword)}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </Modal>
    );
  }
}
 
export default Inputs;
 
const styles = StyleSheet.create({
  container: {
    paddingTop: 23
  },
  input: {
    margin: 15,
    height: 40,
    borderColor: "#7a42f4",
    borderWidth: 1
  },
  submitButton: {
    backgroundColor: "#7a42f4",
    padding: 10,
    margin: 15,
    height: 40
  },
  submitButtonText: {
    color: "white"
  }
});