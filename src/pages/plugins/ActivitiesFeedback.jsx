import React, { useState, useEffect } from 'react';
import { useActivities } from '../../contexts/ActivitiesContext';
import { useUsers } from '../../contexts/UsersContext';
import axios from 'axios';
import { baseUrl } from '../../consts';

const ActivitiesFeedback = () => {
    const { activities, isLoading, error } = useActivities();
    const { fetchUserById } = useUsers();
    const [feedback, setFeedback] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [feedbackError, setFeedbackError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [userCache, setUserCache] = useState({});
    const [activityRatings, setActivityRatings] = useState({});
    const [ratingFilterType, setRatingFilterType] = useState('all');
    const [ratingFilterValue, setRatingFilterValue] = useState(null);
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const itemsPerPage = 15;

    const fetchFeedback = async (activityId, activityName) => {
        try {
            const response = await axios.get(`${baseUrl}/activities-feedback-plugin/feedback_activities/${activityId}/all`);
            setFeedback(response.data);
            setSelectedActivity(activityName);
            setFeedbackError(null);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching feedback:", err);
            setFeedbackError("Failed to fetch feedback.");
        }
    };

    const fetchActivityRating = async (activityId) => {
        try {
            const response = await axios.get(`${baseUrl}/activities-feedback-plugin/feedback_activities/${activityId}/all`);
            const feedbacks = response.data;

            if (feedbacks.length > 0) {
                const averageRating =
                    feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length;
                setActivityRatings((prev) => ({
                    ...prev,
                    [activityId]: averageRating.toFixed(1),
                }));
            } else {
                setActivityRatings((prev) => ({
                    ...prev,
                    [activityId]: "N/A",
                }));
            }
        } catch (err) {
            console.error(`Error fetching ratings for activity ID ${activityId}:`, err);
        }
    };

    useEffect(() => {
        activities.forEach((activity) => {
            fetchActivityRating(activity.id);
        });
    }, [activities]);

    const getUserName = async (userId) => {
        if (userCache[userId]) {
            return userCache[userId];
        }
        try {
            const user = await fetchUserById(userId);
            const userName = `${user.firstName} ${user.lastName}`;
            setUserCache((prev) => ({ ...prev, [userId]: userName }));
            return userName;
        } catch (err) {
            console.error(`Error fetching user with ID ${userId}:`, err);
            return `User ID: ${userId}`;
        }
    };

    const filteredFeedback = feedback.filter((item) => {
        const matchesRating = (() => {
            if (ratingFilterType === 'all') return true;
            if (ratingFilterType === 'above') return item.rating > ratingFilterValue;
            if (ratingFilterType === 'below') return item.rating < ratingFilterValue;
            if (ratingFilterType === 'exact') return item.rating === ratingFilterValue;
            return true;
        })();

        const matchesUserType =
            userTypeFilter === 'all'
                ? true
                : userTypeFilter === 'anonymous'
                ? item.user_id.startsWith('anon')
                : !item.user_id.startsWith('anon');

        return matchesRating && matchesUserType;
    });

    const paginatedFeedback = filteredFeedback.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);

    return (
        <div className="w-full min-h-svh p-4 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-primary">Activities Feedback</h1>

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold">Activities</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center my-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 bg-base-200 rounded-lg">
                        <p className="text-lg text-gray-500">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className={`bg-base-100 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                                    selectedActivity === activity.name ? 'ring-2 ring-primary' : ''
                                }`}
                                onClick={() => fetchFeedback(activity.id, activity.name)}
                            >
                                <div className="p-4">
                                    <h4 className="font-bold text-primary mb-2">{activity.name}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        <strong>Average Rating:</strong>{' '}
                                        {activityRatings[activity.id] || 'Loading...'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedActivity && (
                <div className="mt-8">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                        Feedback for: {selectedActivity}
                    </h2>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Filter by Rating:</label>
                            <select
                                className="select select-bordered mb-2"
                                value={ratingFilterType}
                                onChange={(e) => setRatingFilterType(e.target.value)}
                            >
                                <option value="all">All Ratings</option>
                                <option value="above">Above</option>
                                <option value="below">Below</option>
                                <option value="exact">Exact</option>
                            </select>
                            {ratingFilterType !== 'all' && (
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    placeholder="Enter rating"
                                    value={ratingFilterValue || ''}
                                    onChange={(e) => setRatingFilterValue(Number(e.target.value))}
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Filter by User Type:</label>
                            <select
                                className="select select-bordered"
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value)}
                            >
                                <option value="all">All Users</option>
                                <option value="anonymous">Anonymous Users</option>
                                <option value="named">Named Users</option>
                            </select>
                        </div>
                    </div>

                    {feedbackError && <p className="text-red-500">{feedbackError}</p>}
                    {filteredFeedback.length === 0 ? (
                        <div className="text-center py-8 bg-base-200 rounded-lg">
                            <p className="text-lg text-gray-500">No feedback available for this activity.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedFeedback.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-base-100 rounded-lg shadow-sm p-4"
                                    >
                                        <p>
                                            <strong>User:</strong>{' '}
                                            {item.user_id.startsWith('anon')
                                                ? 'Usuário Anônimo'
                                                : userCache[item.user_id] || (
                                                      <span>
                                                          {getUserName(item.user_id).then((userName) => {
                                                              setUserCache((prev) => ({
                                                                  ...prev,
                                                                  [item.user_id]: userName,
                                                              }));
                                                          }) || 'Loading...'}
                                                      </span>
                                                  )}
                                        </p>
                                        <p>
                                            <strong>Rating:</strong> {item.rating}
                                        </p>
                                        <p>
                                            <strong>Comment:</strong> {item.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <p>
                                    Page {currentPage} of {totalPages}
                                </p>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivitiesFeedback;