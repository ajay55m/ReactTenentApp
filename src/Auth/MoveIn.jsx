//src/auth/MoveInjsx 
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useSession } from '../context/SessionContext';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Switch,
  ImageBackground,
  Image,
} from 'react-native';

const MoveIn = ({ navigation, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    // Page 1: Applicant Details
    customerType: 'Owner',
    ownerStayingInApartment: false,
    apartmentRentedOut: false,
    apartmentWillBeRentedOut: false,
    title: 'Mr.',
    customerName: '',
    mobileNumber: '+971 741852963',
    email: '',
    country: '',
    city: '',
    zipCode: '',
    moveInDate: '',
    gender: '',
    alternativeNumber: '',
    alternativeEmail: '',
    state: '',
    nationality: '',
    
    // Page 2: Property Details
    area: 'DUBAI PRODUCTION CITY',
    building: 'AFNAN 5 (B6)',
    unit: '806',
    
    // Page 3: KYC Details
    emiratesId: '',
    emiratesIdExpiryDate: '',
    passportNo: '',
    passportExpiryDate: '',
    ejarlContractNo: '',
    ejarlStartDate: '',
    ejarlExpiryDate: '',
    
    // Page 4: Upload Documents
    documents: [],
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleSwitch = (field) => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const handleNext = () => {
    if (currentPage < 4) {
      setCurrentPage(currentPage + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      if (navigation && typeof navigation.goBack === 'function') {
        navigation.goBack();
      } else if (onClose && typeof onClose === 'function') {
        onClose();
      }
    }
  };

  const { saveSession } = useSession();

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', formData);
    try {
      const sessionPayload = {
        FirstName: formData.customerName || 'User',
        ClientId: (formData.mobileNumber || `temp-${Date.now()}`).toString(),
        ClientTypeid: 1,
        EMail: formData.email || '',
        MobileNumber: formData.mobileNumber || '',
      };

      // Save session so the app will treat the user as logged in
      saveSession?.(sessionPayload);

      // Provide feedback to the user
      Alert.alert('Success', 'Signup successful — you are now logged in.');
    } catch (e) {
      console.warn('Signup handling error', e);
      Alert.alert('Error', 'Unable to complete signup. Please try again.');
    }
  };

  const renderProgressSteps = () => {
    const steps = [
      { number: 1, title: 'Applicant Details' },
      { number: 2, title: 'Property Details' },
      { number: 3, title: 'KYC Details' },
      { number: 4, title: 'Documents' },
    ];

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <View style={styles.stepContainer}>
                <View
                  style={[
                    styles.stepCircle,
                    step.number <= currentPage && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step.number <= currentPage && styles.stepNumberActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    step.number <= currentPage && styles.stepTitleActive,
                  ]}
                >
                  {step.title}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View style={styles.stepLineContainer}>
                  <View
                    style={[
                      styles.stepLine,
                      step.number < currentPage && styles.stepLineActive,
                    ]}
                  />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  const renderOwnerPage1 = () => {
    return (
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Customer Type*</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('customerType', 'Owner')}
          >
            <View style={styles.radioCircle}>
              {formData.customerType === 'Owner' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Owner:</Text>
          </TouchableOpacity>
          
          <View style={styles.radioSubOptions}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>I am staying in this Apartment</Text>
              <Switch
                value={formData.ownerStayingInApartment}
                onValueChange={() => toggleSwitch('ownerStayingInApartment')}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>This apartment is rented out</Text>
              <Switch
                value={formData.apartmentRentedOut}
                onValueChange={() => toggleSwitch('apartmentRentedOut')}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>This apartment will be rented out</Text>
              <Switch
                value={formData.apartmentWillBeRentedOut}
                onValueChange={() => toggleSwitch('apartmentWillBeRentedOut')}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.radioOption, { marginTop: 15 }]}
            onPress={() => handleInputChange('customerType', 'Tenant')}
          >
            <View style={styles.radioCircle}>
              {formData.customerType === 'Tenant' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Tenant</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Unit Type*</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={formData.title}
          onChangeText={(text) => handleInputChange('title', text)}
        />

        <Text style={styles.label}>Customer Name*</Text>
        <View style={styles.rowInput}>
          <TextInput
            style={[styles.input, { flex: 0.3, marginRight: 10 }]}
            placeholder="Title"
            value="Mr."
            editable={false}
          />
          <TextInput
            style={[styles.input, { flex: 0.7 }]}
            placeholder="Owner Sep 25"
            value={formData.customerName}
            onChangeText={(text) => handleInputChange('customerName', text)}
          />
        </View>

        <Text style={styles.label}>Mobile Number*</Text>
        <TextInput
          style={styles.input}
          placeholder="+971 741852963"
          value={formData.mobileNumber}
          onChangeText={(text) => handleInputChange('mobileNumber', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email*</Text>
        <TextInput
          style={styles.input}
          placeholder="yahaf59422@camjoint.com"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Country*</Text>
        <TextInput
          style={styles.input}
          placeholder="-- Select Country --"
          value={formData.country}
          onChangeText={(text) => handleInputChange('country', text)}
        />

        <Text style={styles.label}>Address*</Text>
        <View style={styles.rowInput}>
          <TextInput
            style={[styles.input, { flex: 0.5, marginRight: 10 }]}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => handleInputChange('city', text)}
          />
          <TextInput
            style={[styles.input, { flex: 0.5 }]}
            placeholder="Zip Code"
            value={formData.zipCode}
            onChangeText={(text) => handleInputChange('zipCode', text)}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Movein Date*</Text>
        <TextInput
          style={styles.input}
          placeholder="dd / mm / yyyy"
          value={formData.moveInDate}
          onChangeText={(text) => handleInputChange('moveInDate', text)}
        />

        <Text style={styles.label}>Gender*</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('gender', 'Male')}
          >
            <View style={styles.radioCircle}>
              {formData.gender === 'Male' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('gender', 'Female')}
          >
            <View style={styles.radioCircle}>
              {formData.gender === 'Female' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('gender', 'Other')}
          >
            <View style={styles.radioCircle}>
              {formData.gender === 'Other' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Other</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Alternative Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Alternative Number"
          value={formData.alternativeNumber}
          onChangeText={(text) => handleInputChange('alternativeNumber', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Alternative Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Alternative Email"
          value={formData.alternativeEmail}
          onChangeText={(text) => handleInputChange('alternativeEmail', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>State*</Text>
        <TextInput
          style={styles.input}
          placeholder="-- Select State --"
          value={formData.state}
          onChangeText={(text) => handleInputChange('state', text)}
        />
      </ScrollView>
    );
  };

  const renderTenantPage1 = () => {
    return (
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Customer Type*</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('customerType', 'Owner')}
          >
            <View style={styles.radioCircle}>
              {formData.customerType === 'Owner' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Owner</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('customerType', 'Tenant')}
          >
            <View style={styles.radioCircle}>
              {formData.customerType === 'Tenant' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Tenant</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Unit Type*</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={formData.title}
          onChangeText={(text) => handleInputChange('title', text)}
        />

        <View style={styles.rowInput}>
          <View style={{ flex: 0.3, marginRight: 10 }}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Mr."
              value="Mr."
              editable={false}
            />
          </View>
          <View style={{ flex: 0.7 }}>
            <Text style={styles.label}>Customer Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="sep25"
              value={formData.customerName}
              onChangeText={(text) => handleInputChange('customerName', text)}
            />
          </View>
        </View>

        <Text style={styles.label}>Mobile Number*</Text>
        <TextInput
          style={styles.input}
          placeholder="+971 741852963"
          value={formData.mobileNumber}
          onChangeText={(text) => handleInputChange('mobileNumber', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email*</Text>
        <TextInput
          style={styles.input}
          placeholder="sharmitesting92@gmail.com"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Movein Date*</Text>
        <TextInput
          style={styles.input}

          placeholder="dd / mm / yyyy"
          value={formData.moveInDate}
          onChangeText={(text) => handleInputChange('moveInDate', text)}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('gender', 'Male')}
          >
            <View style={styles.radioCircle}>
              {formData.gender === 'Male' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('gender', 'Female')}
          >
            <View style={styles.radioCircle}>
              {formData.gender === 'Female' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => handleInputChange('gender', 'Other')}
          >
            <View style={styles.radioCircle}>
              {formData.gender === 'Other' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioText}>Other</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Alternative Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Alternative Number"
          value={formData.alternativeNumber}
          onChangeText={(text) => handleInputChange('alternativeNumber', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Alternative Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Alternative Email"
          value={formData.alternativeEmail}
          onChangeText={(text) => handleInputChange('alternativeEmail', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>State*</Text>
        <TextInput
          style={styles.input}
          placeholder="-- Select State --"
          value={formData.state}
          onChangeText={(text) => handleInputChange('state', text)}
        />

        <Text style={styles.label}>Country*</Text>
        <TextInput
          style={styles.input}
          placeholder="-- Select Country --"
          value={formData.country}
          onChangeText={(text) => handleInputChange('country', text)}
        />

        <Text style={styles.label}>Address*</Text>
        <View style={styles.rowInput}>
          <TextInput
            style={[styles.input, { flex: 0.5, marginRight: 10 }]}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => handleInputChange('city', text)}
          />
          <TextInput
            style={[styles.input, { flex: 0.5 }]}
            placeholder="Zip Code"
            value={formData.zipCode}
            onChangeText={(text) => handleInputChange('zipCode', text)}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Nationality*</Text>
        <TextInput
          style={styles.input}
          placeholder="Nationality"
          value={formData.nationality}
          onChangeText={(text) => handleInputChange('nationality', text)}
        />
      </ScrollView>
    );
  };

  const renderPage1 = () => {
    if (formData.customerType === 'Owner') {
      return renderOwnerPage1();
    } else {
      return renderTenantPage1();
    }
  };

  const renderPage2 = () => {
    return (
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Area*</Text>
        <Text style={styles.areaText}>DUBAI PRODUCTION CITY</Text>

        <Text style={styles.label}>Building*</Text>
        <TextInput
          style={styles.input}
          value={formData.building}
          onChangeText={(text) => handleInputChange('building', text)}
        />

        <Text style={styles.label}>Unit*</Text>
        <TextInput
          style={styles.input}
          value={formData.unit}
          onChangeText={(text) => handleInputChange('unit', text)}
          keyboardType="numeric"
        />
      </ScrollView>
    );
  };

  const renderPage3 = () => {
    return (
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Emirates Id*</Text>
        <TextInput
          style={styles.input}
          value={formData.emiratesId}
          onChangeText={(text) => handleInputChange('emiratesId', text)}
          placeholder="Emirates Id"
        />

        <Text style={styles.label}>Emirates Id Expiry Date*</Text>
        <TextInput
          style={styles.input}
          value={formData.emiratesIdExpiryDate}
          onChangeText={(text) => handleInputChange('emiratesIdExpiryDate', text)}
          placeholder="dd / mm / yyyy"
        />

        <Text style={styles.label}>Passport No*</Text>
        <TextInput
          style={styles.input}
          value={formData.passportNo}
          onChangeText={(text) => handleInputChange('passportNo', text)}
          placeholder="Passport No"
        />

        <Text style={styles.label}>Passport Expiry Date*</Text>
        <TextInput
          style={styles.input}
          value={formData.passportExpiryDate}
          onChangeText={(text) => handleInputChange('passportExpiryDate', text)}
          placeholder="dd / mm / yyyy"
        />

        <Text style={styles.label}>Ejarl Contract No*</Text>
        <TextInput
          style={styles.input}
          value={formData.ejarlContractNo}
          onChangeText={(text) => handleInputChange('ejarlContractNo', text)}
          placeholder="Ejarl Contract No"
        />

        <Text style={styles.label}>Ejarl Start Date*</Text>
        <TextInput
          style={styles.input}
          value={formData.ejarlStartDate}
          onChangeText={(text) => handleInputChange('ejarlStartDate', text)}
          placeholder="dd / mm / yyyy"
        />

        <Text style={styles.label}>Ejarl Expiry Date*</Text>
        <TextInput
          style={styles.input}
          value={formData.ejarlExpiryDate}
          onChangeText={(text) => handleInputChange('ejarlExpiryDate', text)}
          placeholder="dd / mm / yyyy"
        />

        <Text style={styles.label}>Nationality*</Text>
        <TextInput
          style={styles.input}
          value={formData.nationality}
          onChangeText={(text) => handleInputChange('nationality', text)}
          placeholder="Nationality"
        />

        <Text style={styles.mandatoryNote}>(*) Mandatory</Text>
      </ScrollView>
    );
  };

  const renderPage4 = () => {
    return (
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Upload Documents</Text>
        <Text style={styles.uploadDescription}>
          Please upload the required documents. All documents should be clear and readable.
        </Text>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>1. Emirates ID (Front & Back)</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Max size: 5MB, Formats: JPG, PNG, PDF</Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>2. Passport Copy</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Max size: 5MB, Formats: JPG, PNG, PDF</Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>3. Ejarl Contract</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Max size: 10MB, Format: PDF</Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>4. Recent Utility Bill</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Max size: 5MB, Formats: JPG, PNG, PDF</Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>5. Passport Size Photo</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Max size: 2MB, Formats: JPG, PNG</Text>
        </View>

        <Text style={styles.note}>
          Note: All documents will be verified. Please ensure they are valid and not expired.
        </Text>
      </ScrollView>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return renderPage1();
      case 2:
        return renderPage2();
      case 3:
        return renderPage3();
      case 4:
        return renderPage4();
      default:
        return renderPage1();
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>SIGN UP</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Steps */}
        {renderProgressSteps()}

        {/* Form Content */}
        <View style={styles.content}>
          {renderCurrentPage()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.backButtonFooter} onPress={handleBack}>
            <Text style={styles.backButtonTextFooter}>
              {currentPage === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentPage === 4 ? 'Submit' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepCircleActive: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepTitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    width: 70,
  },
  stepTitleActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  stepLineContainer: {
    flex: 1,
    height: 1,
    justifyContent: 'center',
  },
  stepLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 2,
  },
  stepLineActive: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioGroup: {
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  radioSubOptions: {
    marginLeft: 30,
    marginTop: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  switchLabel: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  areaText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  mandatoryNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 30,
    textAlign: 'center',
  },
  uploadSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  note: {
    fontSize: 14,
    color: '#ff9800',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffecb3',
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'space-between',
  },
  backButtonFooter: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonTextFooter: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    flex: 1,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MoveIn;