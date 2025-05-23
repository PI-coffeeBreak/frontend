import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useActivities } from '../../contexts/ActivitiesContext';
import { useUsers } from '../../contexts/UsersContext';
import axios from 'axios';
import { baseUrl } from '../../consts';
import { FaTimes, FaSearch } from 'react-icons/fa';

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
    const [activitySearchQuery, setActivitySearchQuery] = useState('');
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

    const filteredActivities = activities.filter(activity => 
        activity.name.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(activitySearchQuery.toLowerCase())
    );

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
            <div>
                <div className="mb-6">
                    <div className="form-control w-full max-w-md">
                        <div className="input-group flex flex-row gap-2">
                            <input
                                type="text"
                                placeholder={t('activitiesFeedback.searchActivities')}
                                className="input input-bordered w-full"
                                value={activitySearchQuery}
                                onChange={(e) => setActivitySearchQuery(e.target.value)}
                            />
                            <button className="btn btn-square">
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredActivities.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-base-200 rounded-lg">
                            <div className="flex flex-col items-center gap-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-lg text-gray-500">{t('activitiesFeedback.noActivitiesFound')}</p>
                                {activitySearchQuery && (
                                    <p className="text-sm text-gray-400">{t('activitiesFeedback.tryDifferentSearch')}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        filteredActivities.map((activity) => (
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
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">
                    {t('activitiesFeedback.title')}
                </h1>
                {selectedActivity && (
                    <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                            setSelectedActivity(null);
                            setSelectedActivityId(null);
                            setFeedback([]);
                        }}
                    >
                        <FaTimes className="mr-2" />
                        {t('activitiesFeedback.backToActivities')}
                    </button>
                )}
            </div>

            {content}

            {selectedActivity && (
                <div className="mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold">
                                {t('activitiesFeedback.feedbackFor')} {selectedActivity}
                            </h2>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    {'★'.repeat(Math.round(activityRatings[selectedActivityId]?.average || 0))}
                                </div>
                                <span className="text-gray-600">
                                    {activityRatings[selectedActivityId]?.average || t('activitiesFeedback.loading')}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    ({filteredFeedback.length} {t('activitiesFeedback.reviews')})
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-2">
                                <select
                                    className="select select-bordered select-sm rounded-xl"
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
                                        min="1"
                                        max="5"
                                        className="input input-bordered input-sm rounded-xl"
                                        placeholder={t('activitiesFeedback.enterRating')}
                                        value={ratingFilterValue || ''}
                                        onChange={(e) => setRatingFilterValue(Number(e.target.value))}
                                    />
                                )}
                            </div>
                            <select
                                className="select select-bordered select-sm rounded-xl"
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value)}
                            >
                                <option value="all">{t('activitiesFeedback.allUsers')}</option>
                                <option value="anonymous">{t('activitiesFeedback.anonymousUsers')}</option>
                                <option value="named">{t('activitiesFeedback.namedUsers')}</option>
                            </select>
                        </div>
                    </div>

                    {feedbackError && (
                        <div className="alert alert-error mb-4">
                            <FaTimes />
                            <span>{feedbackError}</span>
                        </div>
                    )}

                    {filteredFeedback.length === 0 ? (
                        <div className="text-center py-12 bg-base-200 rounded-lg">
                            <div className="flex flex-col items-center gap-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-lg text-gray-500">{t('activitiesFeedback.noFeedback')}</p>
                                {ratingFilterType !== 'all' || userTypeFilter !== 'all' ? (
                                    <p className="text-sm text-gray-400">{t('activitiesFeedback.tryDifferentFilters')}</p>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-base-100 rounded-lg p-2 mb-4">
                                <div className="space-y-1">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const percentage = activityRatings[selectedActivityId]?.percentages?.[rating - 1] || 0;
                                        const count = filteredFeedback.filter(item => item.rating === rating).length;
                                        return (
                                            <div key={rating} className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 w-16">
                                                    <span className="text-yellow-500">{rating}★</span>
                                                    <span className="text-xs text-gray-500">({count})</span>
                                                </div>
                                                <div className="flex-1 h-1.5 bg-base-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-500 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 w-12 text-right">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedFeedback.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-base-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">
                                                {item.user_id.startsWith('anon') ? (
                                                    <span className="text-gray-500">{t('activitiesFeedback.anonymousUser')}</span>
                                                ) : (
                                                    userCache[item.user_id] || (
                                                        <span className="text-gray-400">
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
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                {'★'.repeat(item.rating)}
                                                <span className="text-gray-500 text-sm">({item.rating})</span>
                                            </div>
                                        </div>
                                                {item.comment && (
                                                    <p className="text-gray-600 mt-2 border-t pt-2">
                                                        {item.comment}
                                                    </p>
                                                )}
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        {t('activitiesFeedback.previous')}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                            {t('activitiesFeedback.showing')} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredFeedback.length)} {t('activitiesFeedback.of')} {filteredFeedback.length}
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        {t('activitiesFeedback.next')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivitiesFeedback;