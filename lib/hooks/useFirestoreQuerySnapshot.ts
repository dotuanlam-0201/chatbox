import { DocumentData, Query, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"

interface IUseFirestoreProps {
    query: Query<DocumentData>
}

export const useFirestoreQuerySnapshot = (props: IUseFirestoreProps) => {
    debugger
    const { query } = props
    const [documentQuerySnapShot, setDocumentQuerySnapShot] = useState({} as DocumentData)
    const load = async () => {
        const querySnapshot = await getDocs(query);
        querySnapshot.forEach((doc) => {
            if (doc.exists()) {
                setDocumentQuerySnapShot(doc.data())
            }
        });
    }
    useEffect(() => {
        if (query) {
            load()
        }
        return () => {
            load()
        }
    }, [JSON.stringify(query)])
    return documentQuerySnapShot
}