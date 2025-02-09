import mongoose from "mongoose";

const counterIdSchema = mongoose.Schema(
  {
        id: {
          type: String, 
          required: true ,
        },
        
        seq: {
          type: Number,
          required: true,
        },
        
      },
      {
        timestamps: true,
      }
);

export const CounterID = mongoose.model("CounterID", counterIdSchema);

CounterID.syncIndexes();
