import { db } from "@/firebase/config"
import { DocumentData, WhereFilterOp, collection, getDocs, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"

interface IUseFirestoreProps {
    collectionName: string
    condition: {
        fieldName: string,
        operator: WhereFilterOp,
        compareValue: string
    }
}

export const useFirestoreQuerySnapshot = (props: IUseFirestoreProps) => {
    const { collectionName, condition } = props
    const [documentQuerySnapShot, setDocumentQuerySnapShot] = useState({} as DocumentData)

    const load = async () => {
        const q = query(collection(db, collectionName), where(condition.fieldName, condition.operator, condition.compareValue));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            if (doc.id) {
                setDocumentQuerySnapShot(doc.data())
            }
        });
    }

    useEffect(() => {
        if (!collectionName || !condition) {
            return
        }
        load()
    }, [collectionName, JSON.stringify(condition)])
    return  documentQuerySnapShot 
}