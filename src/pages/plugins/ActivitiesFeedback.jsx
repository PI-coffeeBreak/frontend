import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useActivities } from '../../contexts/ActivitiesContext';
import { useUsers } from '../../contexts/UsersContext';
import axios from 'axios';
import { baseUrl } from '../../consts';

const ActivitiesFeedback = () => {
    const { t } = useTranslation();
    const { activities, isLoading, error } = useActivities();
    const { fetchUserById } = useUsers();
    const [feedback, setFeedback] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedActivityId, setSelectedActivityId] = useState(null);
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
            const response = await axios.get(`${baseUrl}/activities-feedback-plugin/feedback_activities/${activityId}/all/`);
            setFeedback(response.data);
            setSelectedActivity(activityName);
            setSelectedActivityId(activityId);
            setFeedbackError(null);
            setCurrentPage(1);
        } catch (err) {
            console.error(t('activitiesFeedback.error'), err);
            setFeedbackError(t('activitiesFeedback.error'));
            setSelectedActivityId(null);
        }
    };

    const fetchActivityRating = async (activityId) => {
        try {
            const response = await axios.get(`${baseUrl}/activities-feedback-plugin/feedback_activities/${activityId}/all/`);
            const feedbacks = response.data;

            if (feedbacks.length > 0) {
                const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 => rating 1, Index 4 => rating 5
                feedbacks.forEach((feedback) => {
                    if (feedback.rating >= 1 && feedback.rating <= 5) {
                        ratingCounts[feedback.rating - 1]++;
                    }
                });

                const total = feedbacks.length;
                const percentages = ratingCounts.map(count => ((count / total) * 100).toFixed(1));

                const averageRating =
                    feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / total;

                setActivityRatings((prev) => ({
                    ...prev,
                    [activityId]: {
                        average: averageRating.toFixed(1),
                        percentages,
                    },
                }));
            } else {
                setActivityRatings((prev) => ({
                    ...prev,
                    [activityId]: {
                        average: t('activitiesFeedback.noFeedback'),
                        percentages: [],
                    },
                }));
            }
        } catch (err) {
            console.error(t('activitiesFeedback.error'), err);
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
            return t('activitiesFeedback.anonymousUser');
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

        const isAnonymousUser = item.user_id.startsWith('anon');
        let matchesUserType;

        if (userTypeFilter === 'all') {
            matchesUserType = true;
        } else if (userTypeFilter === 'anonymous') {
            matchesUserType = isAnonymousUser;
        } else {
            matchesUserType = !isAnonymousUser;
        }

        return matchesRating && matchesUserType;
    });

    const paginatedFeedback = filteredFeedback.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);

    let content;

    if (isLoading) {
        content = (
            <div className="flex justify-center my-8">
                <span className="loading loading-spinner loading-lg">{t('activitiesFeedback.loading')}</span>
            </div>
        );
    } else if (error) {
        content = (
            <div className="text-center py-8 bg-base-200 rounded-lg">
                <p className="text-lg text-gray-500">{t('activitiesFeedback.error')}</p>
            </div>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map((activity) => (
                    <button
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
                                <strong>{t('activitiesFeedback.averageRating')}:</strong>{' '}
                                {activityRatings[activity.id]?.average || t('activitiesFeedback.loading')}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold my-8">
                {t('activitiesFeedback.title')}
            </h1>


            {content}

            {selectedActivity && (
                <div className="mt-8">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                        {t('activitiesFeedback.feedbackFor')} {selectedActivity}
                    </h2>
                    <div className="mb-4 text-sm text-gray-500">
                      <p>
                        <strong>{t('activitiesFeedback.averageRating')}:</strong>{' '}
                        {activityRatings[selectedActivityId]?.average || t('activitiesFeedback.loading')}
                      </p>
                      {activityRatings[selectedActivityId]?.percentages && (
                        <div className="mt-1">
                          {activityRatings[selectedActivityId].percentages.map((percent, index) => (
                            <p key={index} className="flex items-center gap-1">
                              {'★'.repeat(index + 1)}: {percent}%
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <div>
                            <select
                                className="select select-bordered rounded-xl mb-2"
                                value={ratingFilterType}
                                onChange={(e) => setRatingFilterType(e.target.value)}
                            >
                                <option value="all">{t('activitiesFeedback.allRatings')}</option>
                                <option value="above">{t('activitiesFeedback.above')}</option>
                                <option value="below">{t('activitiesFeedback.below')}</option>
                                <option value="exact">{t('activitiesFeedback.exact')}</option>
                            </select>
                            {ratingFilterType !== 'all' && (
                                <input
                                    type="number"
                                    className="input input-bordered rounded-xl"
                                    placeholder={t('activitiesFeedback.enterFeedback')}
                                    value={ratingFilterValue || ''}
                                    onChange={(e) => setRatingFilterValue(Number(e.target.value))}
                                />
                            )}
                        </div>
                        <div>
                            <select
                                className="select select-bordered rounded-xl"
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value)}
                            >
                                <option value="all">{t('activitiesFeedback.allUsers')}</option>
                                <option value="anonymous">{t('activitiesFeedback.anonymousUsers')}</option>
                                <option value="named">{t('activitiesFeedback.namedUsers')}</option>
                            </select>
                        </div>
                    </div>

                    {feedbackError && <p className="text-red-500">{feedbackError}</p>}
                    {filteredFeedback.length === 0 ? (
                        <div className="text-center py-8 bg-base-200 rounded-lg">
                            <p className="text-lg text-gray-500">{t('activitiesFeedback.noFeedback')}</p>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedFeedback.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-base-100 rounded-lg shadow-sm p-4"
                                    >
                                        <p>
                                            <strong>{t('activitiesFeedback.user')}:</strong>{' '}
                                            {item.user_id.startsWith('anon') ? (
                                                t('activitiesFeedback.anonymousUser')
                                            ) : (
                                                userCache[item.user_id] || (
                                                    <span>
                                                        {t('activitiesFeedback.loading')}
                                                        {getUserName(item.user_id).then((userName) => {
                                                            setUserCache((prev) => ({
                                                                ...prev,
                                                                [item.user_id]: userName,
                                                            }));
                                                        })}
                                                    </span>
                                                )
                                            )}
                                        </p>
                                        <p>
                                            <strong>{t('activitiesFeedback.rating')}:</strong> {item.rating}
                                        </p>
                                        <p>
                                            <strong>{t('activitiesFeedback.comment')}:</strong> {item.comment}
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
                                    {t('activitiesFeedback.previous')}
                                </button>
                                <p>
                                    {t('activitiesFeedback.page')} {currentPage} {t('activitiesFeedback.of')} {totalPages}
                                </p>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    {t('activitiesFeedback.next')}
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