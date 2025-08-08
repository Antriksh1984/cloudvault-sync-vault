import { Amplify } from 'aws-amplify';

// Configure Amplify with your AWS service details
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_y4GGRCtdR',
      userPoolClientId: '3thf1uf9n8bc7u0sogqv0bjrts',
      signUpVerificationMethod: 'code'
    }
  },
  Storage: {
    S3: {
      bucket: 'adler-personal-storage',
      region: 'ap-south-1',
    }
  },
  API: {
    REST: {
      CV_v1: {
        endpoint: 'https://necll2p9x2.execute-api.ap-south-1.amazonaws.com/Production',
        region: 'ap-south-1'
      }
    }
  }
});

export default Amplify;