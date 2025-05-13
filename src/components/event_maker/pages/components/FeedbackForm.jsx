import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const fallbackData = {
  title: { text: "Rate this Activity" },
  description: { text: "Your opinion helps us improve!" },
  submit_button: { text: "Submit Feedback" },
  rating_scale: 5,
  show_comment_box: true,
  require_auth: false
};

export function FeedbackForm({
  title = fallbackData.title,
  description = fallbackData.description,
  submit_button = fallbackData.submit_button,
  rating_scale = fallbackData.rating_scale,
  show_comment_box = fallbackData.show_comment_box,
  require_auth = fallbackData.require_auth
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setRating(null);
    setComment("");
  };

  return (
    <div className="feedback-form w-full max-w-lg mx-auto p-4 bg-base-100 shadow rounded">
      <h2 className="text-2xl font-bold mb-2">{title?.text || t("feedback.title")}</h2>
      {description?.text && (
        <p className="mb-4 text-gray-700">{description.text || t("feedback.description")}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">
            {t("feedback.ratingLabel")}
          </label>
          <div className="flex gap-1 text-yellow-500 text-2xl">
            {Array.from({ length: rating_scale }, (_, i) => {
              const index = i + 1;
              return (
                <button
                  type="button"
                  key={index}
                  className="focus:outline-none"
                  onClick={() => setRating(index)}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {index <= (hovered || rating) ? <FaStar /> : <FaRegStar />}
                </button>
              );
            })}
          </div>
        </div>

        {show_comment_box && (
          <div>
            <label className="block font-medium mb-1">
              {t("feedback.commentLabel")}
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("feedback.commentPlaceholder")}
            />
          </div>
        )}

        <div className="text-right">
          <button type="submit" className="btn btn-primary">
            {submit_button?.text || t("feedback.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}

FeedbackForm.propTypes = {
  title: PropTypes.object,
  description: PropTypes.object,
  submit_button: PropTypes.object,
  rating_scale: PropTypes.number,
  show_comment_box: PropTypes.bool,
  require_auth: PropTypes.bool
};

export { FeedbackForm as FeedbackFormComponent };
