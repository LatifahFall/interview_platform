'use server';
import {db, auth} from "@/firebase/admin";
import {cookies} from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
    const {uid, name, email}= params;

    try{
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists){
            return{
                success: false,
                message: 'User already exists. Please sign in'
            }
        }
        await db.collection('users').doc(uid).set({
            name,email
        })

        return{
            success: true,
            message: 'User created successfully. Please sign in.'
        }
    }catch(e: any){
        console.error('Error creating user', e);

        if(e.code === 'auth/email-already-exists'){
            return{
                success: false,
                message: 'This email is already in use.'
            }
        }
        return{
            success: false,
            message: 'Something went wrong.'
        }
    }
}

export async function signIn(params: SignInParams){
    const{email, idToken}= params;

    try{
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){
            return{
                success: false,
                message: 'User not found. Create an account first.'
            }
        }
        await setSessionCookie(idToken);
    }catch(e){
        console.log(e);

        return{
            success: false,
            message: 'Failed to log in.'
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000,
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV==='production',
        path: '/',
        sameSite: 'lax'
    })
}

export async function getCurrentUser():Promise<User | null> {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get('session')?.value;

    if(!sessionCookie)return null;

    try{
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        const userRecord = await db
            .collection('users')
            .doc(decodedClaims.uid)
            .get();

        if(!userRecord.exists) return null;

        return{
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    }catch (e){
        console.log(e);
        return null;
    }
}

export async function isAuthenticated(){
    const user = await getCurrentUser();

    //turns the existance/nonexistence of a user into a boolean value
    return !!user;
}

export async function getInterviewsByUserId(userId: string) : Promise<Interview[] | null>{
    console.log("[DEBUG] Querying interviews for user ID:", userId); // 🚨 Log input
    try {
        const interviews = await db
            .collection('interviews')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        console.log("[DEBUG] Firestore Snapshot:", {
            size: interviews.size, // Number of documents found
            docs: interviews.docs.map(doc => doc.data()) // Raw document data
        });

        return interviews.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        })) as Interview[];

    }catch(error) {
        console.error("[ERROR] Failed to query interviews:");
        return null;
    }
}

export async function getLatestInterviews(params: GetLatestInterviewsParams) : Promise<Interview[] | null>{
    const {userId, limit = 20} = params;
    console.log("[DEBUG] Fetching latest interviews for user ID:", userId);

    try {
        const interviews = await db
            .collection('interviews')
            .orderBy('createdAt', 'desc')
            .where('finalized', '==', true)
            .where('userId', '!=', userId)
            .limit(limit)
            .get();

        console.log("[DEBUG] Latest Interviews Snapshot:", {
            size: interviews.size,
            docs: interviews.docs.map(doc => doc.data())
        });

        return interviews.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        })) as Interview[];
    }catch(error) {
        console.error("[ERROR] Failed to fetch latest interviews:", error);
        return null;
    }
}


