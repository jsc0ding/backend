const axios = require('axios');

const verifyApiDoctors = async () => {
  try {
    console.log('Checking API endpoint for doctors...');
    const response = await axios.get('http://localhost:5009/api/queue/doctors');
    console.log('API Response Status:', response.status);
    console.log('Number of doctors from API:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('First doctor from API:', response.data[0].name);
      console.log('Last doctor from API:', response.data[response.data.length - 1].name);
    }
    
    console.log('✅ API verification complete');
  } catch (error) {
    console.error('❌ Error checking API:', error.message);
  }
};

verifyApiDoctors();