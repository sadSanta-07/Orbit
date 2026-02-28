import mongoose from "mongoose";

const CodeRoomSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  code: {
    type: String,
    default: "",
  },
});

export default mongoose.model("CodeRoom", CodeRoomSchema);