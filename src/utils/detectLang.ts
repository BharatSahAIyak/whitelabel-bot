import axios from 'axios';

export const detectLanguage = async (
  text: string | number,
  provider: string | null,
  match: string
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_AI_TOOLS_API}/language-detect`,
      {
        text,
        provider: provider ?? null,
        languageSubset: [match],
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
