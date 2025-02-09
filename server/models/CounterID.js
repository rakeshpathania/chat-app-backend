import mongoose from "mongoose";

const CounteridSchema = mongoose.Schema(
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

export const CounterID = mongoose.model("CounterID", CounteridSchema);

CounterID.syncIndexes();
