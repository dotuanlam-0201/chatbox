import { db } from "@/firebase/config";
import { DocumentData, QueryDocumentSnapshot, WhereFilterOp, collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface IUseFirestoreProps {
    collectionName: string
    condition: {
        fieldName: string,
        operator: WhereFilterOp,
        compareValue: string
    }
}

export const useFirestoreOnSnapshot = (props: IUseFirestoreProps) => {
    const { collectionName, condition } = props
    const [document, setDocument] = useState([] as DocumentData[])

    useEffect(() => {
        if (!collectionName || !condition) {
            return
        }
        const q = query(collection(db, collectionName), orderBy("createAt"), limit(10), where(condition.fieldName, condition.operator, condition.compareValue));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
                return doc.data()
            })
            setDocument(documents)
        });
        return () => {
            unsubscribe()
        }
    }, [collectionName, JSON.stringify(condition)])
    return { document }
}