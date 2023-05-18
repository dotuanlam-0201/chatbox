import { db } from "@/firebase/config";
import { DocumentData, OrderByDirection, Query, QueryDocumentSnapshot, WhereFilterOp, collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface IUseFirestoreProps {
    query: Query<DocumentData>
}

export const useFirestoreOnSnapshot = (props: IUseFirestoreProps) => {
    const { query } = props
    const [documentOnSnapShot, setDocumentOnSnapShot] = useState([] as DocumentData[])

    useEffect(() => {
        if (!query) {
            return
        }
        const unsubscribe = onSnapshot(query, (querySnapshot) => {
            const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
                return doc.data()
            })
            setDocumentOnSnapShot(documents)
        });
        return () => {
            unsubscribe()
        }
    }, [JSON.stringify(query)])
    return documentOnSnapShot 
}