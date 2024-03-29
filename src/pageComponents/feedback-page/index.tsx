 import React, { useState } from "react";
import styles from "./index.module.css";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { toast } from "react-hot-toast";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import { useConfig } from "../../hooks/useConfig";
import axios from 'axios';
import { useLocalization } from '../../hooks';



const FeedbackPage: React.FC = () => {
  const [star, setStar] = useState(1);
  const [review, setReview] = useState("");
  const theme = useColorPalates();
  const config = useConfig('component', 'feedbackPage');
  const t = useLocalization();
  const handleFeedback = () => {
    if (!config) return;  
    
    if (config?.ratingBox && star === 0) {
      toast.error('Please provide a rating');
      return;
    }

    if (config?.reviewBox && review === "") {
      toast.error('Please provide a review');
      return;
    }
  


    const formData = new FormData();
    formData.append('rating', String(star));
    formData.append('review', review);

    axios.post(`${process.env.NEXT_PUBLIC_BFF_API_URL}/feedback`,  {
              rating: star,
              phoneNumber: localStorage.getItem('phoneNumber'),
            }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth')}`
      }
    })
    .then(() => {
      toast.success('Feedback submitted successfully');
      setStar(1);
      setReview("");
    })
    .catch(error => {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again later.');
    });
  };

  return (
    <div className={styles.container}>
      <Box className={styles.main}>
        <Box>
          <Typography
            sx={{
              fontSize: "5vh",
              fontWeight: "bold",
              color: theme.primary.main
            }}
          >
             {t('label.feedback')}
          </Typography>
        </Box>

        {config?.ratingBox && (
          <Box className={styles.section}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "3vh",
              }}
            >
               {t('message.rating')}
            </Typography>

            <Rating
              data-testid="ratingComponent"
              name="simple-controlled"
              value={star}
              max={config?.ratingMaxStars || 5}
              onChange={(event, newValue) => {
                setStar(newValue || 1);
              }}
              defaultValue={1}
              sx={{
                fontSize: "6vh",
              }}
            />
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "2vh",
              }}
            >
              {t('message.rating_description')}
            </Typography>
            <Button
              id="ratingBtn"
              variant="contained"
              data-testid="ratingBtn"
              sx={{
                mt: 2,
                backgroundColor: `${theme.primary.main}`,
                fontWeight: "bold",
                borderRadius: "10rem",
                fontSize: "1.5vh",
                p: 1.5,
                "&:hover": {
                  backgroundColor: `${theme.primary.dark}`,
                },
              }}
              onClick={handleFeedback}
            >
               {t('label.submit_review')}
            </Button>
          </Box>
        )}

        {config?.reviewBox && (
          <Box className={styles.section}>
            <Typography
              sx={{
                m: "1rem",
                fontWeight: "bold",
                fontSize: "3vh",
              }}
            >
              {t('message.review')}
            </Typography>
            <textarea
              placeholder=  {t("message.review_description")}
              value={review}
              className={styles.textBlock}
              style={{
                border: `2px solid ${theme.primary.main}`
              }}
              onChange={(e) => {
                setReview(e.target.value);
              }}
            />

            <Button
              id="reviewBtn"
              variant="contained"
              data-testid="reviewBtn"
              sx={{
                mt: 2,
                backgroundColor: `${theme.primary.main}`,
                fontWeight: "bold",
                borderRadius: "10rem",
                fontSize: "1.5vh",
                p: 1.5,
                "&:hover": {
                  backgroundColor: `${theme.primary.dark}`,
                },
              }}
              onClick={handleFeedback}
            >
                {t("label.submit_review")}
            </Button>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default FeedbackPage;
