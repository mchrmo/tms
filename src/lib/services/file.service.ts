import {CreateBucketCommand, GetObjectCommand, GetObjectCommandInput, ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import prisma from '../prisma';


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});


const uploadFile = async (name: string, type: string, buffer: Uint8Array) => {

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Your bucket name
    Key: `uploads/${Date.now()}-${name}`, // Unique file name
    Body: buffer, // File data
    ContentType: type, // File type (e.g., image/jpeg)
  }

  
  const command = new PutObjectCommand(params);
  const res = await s3.send(command);

  return params.Key
}

const getFile = async (fileName: string) => {
      // Define the parameters for S3 GetObjectCommand
      const params: GetObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME, // Your bucket name
        Key: fileName, // The file name (key) in the S3 bucket
        
      };
  
      const command = new GetObjectCommand(params);
      const s3Response = await s3.send(command);
  
      // Read the file's data from the S3 response
      const stream = s3Response.Body as Readable;
      const chunks: Uint8Array[] = [];
  
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
  
      return {buffer: Buffer.concat(chunks), type: s3Response.ContentType };
}


const createFile = async (name: string, type: string, path: string, owner_id: number, ref: {id: number, model: string}) => {

  const newFile = await prisma.file.create({
    data: {
      name,
      path,
      extension: type,
      owner: {
        connect: {id: owner_id}
      }
    }
  })

  if(!newFile) throw new Error("Error creating file")
  
  //Add attachment

  if(ref.model == 'task') {
    await prisma.taskAttachment.create({
      data: {
        task_id: ref.id,
        file_id: newFile.id
      }
    })
  } else if (ref.model == 'meetingItem') {

  }


  return newFile
}

const getBucketSize = async () => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Your bucket name
  };

  const command = new ListBucketsCommand({});
  const buckets = await s3.send(command);

  const bucket = buckets.Buckets?.find(b => b.Name === params.Bucket);
  if (!bucket) throw new Error("Bucket not found");

  let size = 0;
  let docs = 0
  const listObjectsCommand = new ListObjectsV2Command(params);
  let objects = await s3.send(listObjectsCommand);

  while (objects.Contents) {
    docs += objects.Contents.length        
    size += objects.Contents.reduce((acc, obj) => acc + (obj.Size || 0), 0);

    if (objects.IsTruncated) {
      objects = await s3.send(new ListObjectsV2Command({
        ...params,
        ContinuationToken: objects.NextContinuationToken,
      }));
    } else {
      break;
    }
  }

  return {size, docs};
}

const fileService = {
  uploadFile,
  getFile,
  createFile,
  getBucketSize
}



export default fileService