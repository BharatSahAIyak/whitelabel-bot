import React, { useState } from "react";
import styles from "./index.module.css";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { toast } from "react-hot-toast";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import { useConfig } from "../../hooks/useConfig";

const FeedbackPage: React.FC = () => {
  const [star, setStar] = useState(1);
  const [review, setReview] = useState("");
  const theme = useColorPalates();
  const config = useConfig('component', 'feedbackPage');
  const handleFeedback = () => {
    const rateBox = config?.ratingBox;
    const reviewContainer = config?.reviewBox;

    const sendReviewSuccess = () => {
      setTimeout(() => {
        toast.success(`Review sent successfully`);
        setReview("");
      }, 2000);
    };

    const sendReviewError = () => {
      toast.error(`Please provide valid review`);
    };

    if (rateBox && reviewContainer) {
      star === 0 ? sendReviewError() : sendReviewSuccess();
    } else if (rateBox && !reviewContainer) {
      star === 0 ? sendReviewError() : sendReviewSuccess();
    } else if (!rateBox && reviewContainer) {
      review === "" ? sendReviewError() : sendReviewSuccess();
    }
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
            {config?.Title || "Feedback"}
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
              {config?.ratingBoxTitle || "Rate your experience"}
            </Typography>

            <Rating
              data-testid="ratingComponent"
              name="simple-controlled"
              value={star}
              max={config?.ratingMaxStars || 5}
              // @ts-ignore
              onChange={(event, newValue) => {
                setStar(() => {
                  return newValue === null ? 1 : newValue;
                });
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
              {config?.ratingStarDescription || "Click on the stars to rate"}
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
              {config?.ratingButtonText || "Submit Rating"}
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
              {config?.reviewBoxTitle || "Write a review"}
            </Typography>
            <textarea
              placeholder={config?.reviewPlaceholder || "Enter your review here"}
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
              {config?.reviewButtonText || "Submit Review"}
            </Button>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default FeedbackPage;
