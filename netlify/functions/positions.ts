import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const positions = {};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.body == null) {
    console.log("empty body");
    return {
      statusCode: 200,
      body: JSON.stringify(positions),
    };
  }
  const { user, x, y, create } = JSON.parse(event.body);
  if (event.httpMethod === 'DELETE') {
    console.log("deleting user: " + user);
    try {
      delete positions[user];
    } catch (error) {
      console.error();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(positions),
    };
  }
  if (!create && !(user in positions)) {
    console.log("not found " + user);
    return {
      statusCode: 404,
    };
  }

  positions[user] = { x, y };
  return {
    statusCode: 200,
    body: JSON.stringify(positions),
  };
};

export { handler };
