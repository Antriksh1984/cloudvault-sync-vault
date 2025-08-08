export async function configureAmplify() {
  const { Amplify } = await import('aws-amplify')
  
  Amplify.configure({
    Auth: {
      region: 'ap-south-1',
      userPoolId: 'ap-south-1_y4GGRCtdR',
      userPoolWebClientId: '3thf1uf9n8bc7u0sogqv0bjrts',
      authenticationFlowType: 'USER_PASSWORD_AUTH'
    },
    Storage: {
      region: 'ap-south-1',
      bucket: 'adler-personal-storage',
      identityPoolId: 'ap-south-1:ce4fa149-520e-44b6-a006-128b8ef30c1b'
    },
    API: {
      endpoints: [
        {
          name: 'CV_v1',
          endpoint: 'https://necll2p9x2.execute-api.ap-south-1.amazonaws.com/Production',
          region: 'ap-south-1'
        }
      ]
    }
  })
}
