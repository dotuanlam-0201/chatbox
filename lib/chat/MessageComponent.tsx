import { Avatar, Card, Col, Popover, Row, Typography } from 'antd'
import _ from "lodash"
import moment from 'moment'
import { useSessionStorage } from 'react-use'
import { CHATBOXCONSTANT } from '../CONTANT'
import { TypeMessage } from './model'

interface IMessageComponentProps {
    message: string
}

const MessageComponent = (props: IMessageComponentProps) => {
    const [id, setid] = useSessionStorage('id', '');
    const parseMessage: TypeMessage = JSON.parse(props.message)

    const handleShowTimeSendAt = () => {
        const twentyFourHoursAgo = moment().subtract(24, "h");
        const { sendAt: { seconds } } = parseMessage
        if (_.isNumber(seconds) && twentyFourHoursAgo.isAfter(moment(seconds * 1000))) {
            return <Typography.Text style={{ color: CHATBOXCONSTANT.colors.primaryColorGray }}>
                {moment(seconds * 1000).format("HH:mm")}
            </Typography.Text>
        } else {
            return <Typography.Text style={{ color: CHATBOXCONSTANT.colors.primaryColorGray }}>
                {moment(seconds * 1000).fromNow()}
            </Typography.Text>
        }
    }

    const handleShowImage = () => {
        if (parseMessage.message.match(/^http[^\?]*.(jpg|jpeg|png)(\?(.*))?$/gmi)) {
            return <img style={{ maxWidth: "100%", objectFit: "scale-down" }} src={parseMessage.message} />
        } else {
            return <Typography.Text>{parseMessage.message}</Typography.Text>
        }
    }

    return (
        <>
            <Card
                style={{
                    maxWidth: 450, marginBottom: 5,
                    backgroundColor: id === parseMessage.id ? "rgb(226, 241, 255)" : "white",
                    marginInlineStart: id !== parseMessage.id ? "inherit" : "auto"
                }}
                bodyStyle={{ minWidth: 300, overflow: "hidden" }}
                bordered
                size='small'
            >
                <Row gutter={[10, 10]} >
                    <Col xs={24}>
                        <Row justify={"space-between"}>
                            <Col>
                                <Avatar style={{ border: "1px solid #e9e9e9" }} src={parseMessage.photoURL} />
                            </Col>
                            <Col>
                                <Popover content={
                                    <Typography.Text>{moment(parseMessage.sendAt.seconds * 1000).format("LLLL")}</Typography.Text>
                                }>
                                    {handleShowTimeSendAt()}
                                </Popover>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24}>
                        {handleShowImage()}
                    </Col>
                </Row>
            </Card>
        </>
    )
}

export default MessageComponent
