import { AppSyncResolverHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(ddbClient);

type PostInput = {
  id: string;
  title: string;
  content: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const handler: AppSyncResolverHandler<{ post: Post }, Post> = async (
  event,
) => {
  const {
    arguments: { post },
  } = event;

  const { Attributes: updatedPost } = await client.send(
    new UpdateCommand({
      TableName: 'posts',
      UpdateExpression:
        'SET #title = :title, #content = :content, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#content': 'content',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':title': post.title,
        ':content': post.content,
        ':updatedAt': new Date().toISOString(),
      },
      Key: {
        id: post.id,
      },
      ReturnValues: 'ALL_NEW',
    }),
  );

  return updatedPost as Post;
};
