import axios from 'axios';

export const detectLanguage = async (text: string | number) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_AI_TOOLS_API}/language-detect`,
      {
        text,
        languageSubset: ['hing'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error detecting language:', error);
  }
};
