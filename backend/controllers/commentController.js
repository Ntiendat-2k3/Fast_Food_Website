import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"

// Get all comments (Admin/Staff only)
const getAllComments = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const status = req.query.status // pending, approved, rejected

    const filter = {}
    if (status) {
      filter.status = status
    }

    console.log("Getting all comments for admin/staff")

    const comments = await commentModel
      .find(filter)
      .populate("userId", "name email")
      .populate("foodId", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await commentModel.countDocuments(filter)

    res.json({
      success: true,
      comments,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: comments.length,
        totalComments: total,
      },
    })
  } catch (error) {
    console.error("Error getting all comments:", error)
    res.json({ success: false, message: "Error fetching comments" })
  }
}

// Get comments by food (Public)
const getCommentsByFood = async (req, res) => {
  try {
    const { foodId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (!foodId) {
      return res.json({ success: false, message: "Food ID is required" })
    }

    const comments = await commentModel
      .find({
        foodId,
        status: "approved",
      })
      .populate("userId", "name")
      .populate("replies.userId", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await commentModel.countDocuments({ foodId, status: "approved" })

    res.json({
      success: true,
      comments,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: comments.length,
        totalComments: total,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching comments" })
  }
}

// Add comment (Authenticated users)
const addComment = async (req, res) => {
  try {
    const { foodId, comment, rating } = req.body
    const userId = req.body.userId

    if (!foodId || !comment) {
      return res.json({ success: false, message: "Food ID and comment are required" })
    }

    // Check if food exists
    const food = await foodModel.findById(foodId)
    if (!food) {
      return res.json({ success: false, message: "Food not found" })
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.json({ success: false, message: "Rating must be between 1 and 5" })
    }

    const newComment = new commentModel({
      userId,
      foodId,
      comment,
      rating: rating || null,
      status: "pending",
    })

    await newComment.save()

    const populatedComment = await commentModel
      .findById(newComment._id)
      .populate("userId", "name")
      .populate("foodId", "name")

    res.json({
      success: true,
      message: "Comment added successfully and is pending approval",
      comment: populatedComment,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error adding comment" })
  }
}

// Update comment status (Admin/Staff only)
const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const moderatorId = req.body.userId

    if (!id || !status) {
      return res.json({ success: false, message: "Comment ID and status are required" })
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.json({ success: false, message: "Invalid status" })
    }

    const comment = await commentModel
      .findByIdAndUpdate(
        id,
        {
          status,
          moderatedBy: moderatorId,
          moderatedAt: new Date(),
        },
        { new: true },
      )
      .populate("userId", "name")

    if (!comment) {
      return res.json({ success: false, message: "Comment not found" })
    }

    const moderator = await userModel.findById(moderatorId)
    console.log(`Comment ${id} status updated to ${status} by ${moderator.name} (${moderator.role})`)

    res.json({
      success: true,
      message: `Comment ${status} successfully`,
      comment,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error updating comment status" })
  }
}

// Reply to comment (Admin/Staff only)
const replyToComment = async (req, res) => {
  try {
    const { id } = req.params
    const { reply } = req.body
    const userId = req.body.userId

    if (!id || !reply) {
      return res.json({ success: false, message: "Comment ID and reply are required" })
    }

    const comment = await commentModel.findById(id)
    if (!comment) {
      return res.json({ success: false, message: "Comment not found" })
    }

    const replyData = {
      userId,
      reply,
      createdAt: new Date(),
    }

    comment.replies.push(replyData)
    await comment.save()

    const updatedComment = await commentModel.findById(id).populate("userId", "name").populate("replies.userId", "name")

    const user = await userModel.findById(userId)
    console.log(`Reply added to comment ${id} by ${user.name} (${user.role})`)

    res.json({
      success: true,
      message: "Reply added successfully",
      comment: updatedComment,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error adding reply" })
  }
}

// Delete comment (Admin/Staff only)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params
    const deletedBy = req.body.userId

    if (!id) {
      return res.json({ success: false, message: "Comment ID is required" })
    }

    const comment = await commentModel.findById(id)
    if (!comment) {
      return res.json({ success: false, message: "Comment not found" })
    }

    await commentModel.findByIdAndDelete(id)

    const user = await userModel.findById(deletedBy)
    console.log(`Comment ${id} deleted by ${user.name} (${user.role})`)

    res.json({ success: true, message: "Comment deleted successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error deleting comment" })
  }
}

// Get comment statistics (Admin/Staff only)
const getCommentStats = async (req, res) => {
  try {
    const totalComments = await commentModel.countDocuments({})
    const pendingComments = await commentModel.countDocuments({ status: "pending" })
    const approvedComments = await commentModel.countDocuments({ status: "approved" })
    const rejectedComments = await commentModel.countDocuments({ status: "rejected" })

    res.json({
      success: true,
      stats: {
        total: totalComments,
        pending: pendingComments,
        approved: approvedComments,
        rejected: rejectedComments,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching comment statistics" })
  }
}

export {
  getAllComments,
  getCommentsByFood,
  addComment,
  updateCommentStatus,
  replyToComment,
  deleteComment,
  getCommentStats,
}
