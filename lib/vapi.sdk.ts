import Vapi from '@vapi-ai/web';

//we're using vapi workflows to simplify building conversation with the AI assistant
//it allows us to design conversations as a series of steps (nodes), guiding the AI
//the assistant asks a series of predefined questions and collects the user's responses
//then the info is sent to our API input (developped using route handlers) that feeds it to Gemini
//gemini generates the questions based on said conversation and the info is stored in a firestore database

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);