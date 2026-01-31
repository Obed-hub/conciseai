import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

export const storageService = {
    async uploadFile(file: File, path: string = 'uploads'): Promise<string> {
        const uniqueId = uuidv4();
        const storageRef = ref(storage, `${path}/${uniqueId}_${file.name}`);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    async uploadUserFile(file: File, userId: string): Promise<string> {
        return this.uploadFile(file, `users/${userId}/files`);
    }
};
