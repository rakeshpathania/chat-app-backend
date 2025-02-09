import mongoose from 'mongoose';
import dotenv from "dotenv"
dotenv.config();


export const connectDB = async () => {
    try {
        
        const con = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useCreateIndex: true
        });

        // for live connection... 
        // const con = await mongoose.connect(`mongodb+srv://<user>:<user>@cluster0.ygxve0k.mongodb.net/${databaseName}?retryWrites=true&w=majority`, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //     //useCreateIndex: true
        // });

        console.log(`Database connected : ${con.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}
