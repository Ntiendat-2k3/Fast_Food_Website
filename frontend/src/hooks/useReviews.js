import { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

export const useReviews = (foodItem) => {
  const { url, token, user } = useContext(StoreContext)
  const [reviews, setReviews] = useState([])
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  })
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [reviewEligibility, setReviewEligibility] = useState(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}`)
      if (response.data.success) {
        setReviews(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Fetch rating stats
  const fetchRatingStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}/stats`)
      if (response.data.success) {
        setRatingStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error)
      setRatingStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {}
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Check review eligibility - sửa lại URL endpoint
  const checkReviewEligibility = async () => {
    if (!token || !user) {
      setReviewEligibility({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        reason: 'not_logged_in'
      })
      return
    }

    try {
      setIsCheckingEligibility(true)
      console.log('Checking eligibility for user:', user._id, 'food:', foodItem._id)

      // Sửa lại URL endpoint để match với backend route
      const response = await axios.get(
        `${url}/api/comment/check/${user._id}/${foodItem._id}`,
        { headers: { token } }
      )

      console.log('Eligibility response:', response.data)

      if (response.data.success) {
        const eligibilityData = response.data.data
        setReviewEligibility({
          canReview: eligibilityData.canReview,
          hasPurchased: eligibilityData.hasPurchased,
          hasReviewed: eligibilityData.hasReviewed,
          existingReview: eligibilityData.existingReview,
          reason: !eligibilityData.hasPurchased ? 'not_purchased' :
                  eligibilityData.hasReviewed ? 'already_reviewed' : 'can_review'
        })
      } else {
        console.error('Eligibility check failed:', response.data.message)
        setReviewEligibility({
          canReview: false,
          hasPurchased: false,
          hasReviewed: false,
          reason: 'error'
        })
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error)
      setReviewEligibility({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        reason: 'error'
      })
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  // Handle review submitted
  const handleReviewSubmitted = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews])
    setShowReviewForm(false)

    // Update rating stats
    fetchRatingStats()

    // Update eligibility
    checkReviewEligibility()

    toast.success('Đánh giá của bạn đã được gửi thành công!')
  }

  // Handle write review
  const handleWriteReview = () => {
    console.log('Handle write review, eligibility:', reviewEligibility)

    if (!token || !user) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
      return
    }

    if (!reviewEligibility?.canReview) {
      if (!reviewEligibility?.hasPurchased) {
        toast.error('Bạn cần mua và nhận được sản phẩm này trước khi đánh giá')
      } else if (reviewEligibility?.hasReviewed) {
        toast.error('Bạn đã đánh giá sản phẩm này rồi')
      } else {
        toast.error('Không thể đánh giá sản phẩm này')
      }
      return
    }

    setShowReviewForm(true)
  }

  // Update review in list
  const updateReviewInList = (updatedReview) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review._id === updatedReview._id ? updatedReview : review
      )
    )
  }

  // Remove review from list
  const removeReviewFromList = (reviewId) => {
    setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId))
  }

  useEffect(() => {
    if (foodItem?._id) {
      fetchReviews()
      fetchRatingStats()
      checkReviewEligibility()
    }
  }, [foodItem?._id, token, user])

  return {
    reviews,
    setReviews,
    ratingStats,
    isLoadingReviews,
    isLoadingStats,
    reviewEligibility,
    isCheckingEligibility,
    showReviewForm,
    setShowReviewForm,
    handleReviewSubmitted,
    handleWriteReview,
    updateReviewInList,
    removeReviewFromList,
    fetchReviews,
    fetchRatingStats
  }
}
