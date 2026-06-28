import mongoose from "mongoose";

export const connectDB = async () => {

    const conn = await mongoose.connect(
'mongodb://anushkasingh8519:taskflow19@ac-zob9oui-shard-00-00.fsr9en3.mongodb.net:27017,ac-zob9oui-shard-00-01.fsr9en3.mongodb.net:27017,ac-zob9oui-shard-00-02.fsr9en3.mongodb.net:27017/?ssl=true&replicaSet=atlas-dp3x4h-shard-0&authSource=admin&appName=TaskFlow'
    );

    console.log("MongoDB Connected");
};