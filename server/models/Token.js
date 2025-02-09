import mongoose from 'mongoose'

const tokenSchema = mongoose.Schema({

    user_id: {
        type: String,
        allowNull: false
      },
      jti: {
        type: String,
        allowNull: false
      },
      token: {
        type: String,
        allowNull: false
      }
}, {
    timestamps: true
})

export const Token = mongoose.model('Token', tokenSchema)
 
Token.syncIndexes();

