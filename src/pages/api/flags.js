export default async function handler(req, res) {
  const { userType } = req.query;

  if (!userType) {
    return res.status(400).json({ error: 'User Type is required' });
  }

  try {
    const flags = getFlags(userType);
    return res.status(200).json({ flags });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch feature flags' });
  }
}

const getFlags = (userType) => {
  switch (userType) {
    case 'farmer':
      return {
        component: {
          homePage: {
            disablePlantProtection: true,
            otherInformationImg:
              'http://cdn-api.prod.bhasai.samagra.io:443/deployer/salesma.svg1723629548517',
          },
        },
        translation: {
          en: {
            'label.faq_question1': 'Seed dealers near me',
            'label.faq_question2': 'Fertilizer dealer near me',
            'label.faq_question3': 'Machinery dealer near me',
            'label.other_information': 'Dealer information',
          },
          hi: {
            'label.faq_question1': 'मेरे पास बीज विक्रेता कहा मिलेंगे',
            'label.faq_question2': 'मेरे पास उर्वरक विक्रेता कहाँ मिलेंगे',
            'label.faq_question3': 'मेरे पास मशीनरी विक्रेता कहाँ मिलेंगे',
            'label.other_information': 'विक्रेताओं की जानकारी',
          },
        },
      };
    default:
      return {};
  }
};
