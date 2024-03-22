import { FC, useCallback, useContext, useEffect, useState } from "react";
import styles from "./style.module.css";

import { List } from "../../components/list";
import ForumIcon from "@mui/icons-material/Forum";
import { IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import moment from "moment";
import _ from 'underscore';
import { component } from "./config.json";
import { ChatItem, HistoryItem } from "./index.d";
import { map } from "lodash";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import { FullPageLoader } from "../../components/fullpage-loader";
import { useFlags } from "flagsmith/react";
import { useLocalization } from "../../hooks";

import axios from "axios";
import ComingSoonPage from "../coming-soon-page";
import { useConfig } from "../../hooks/useConfig";


const HistoryPage: FC = () => {
    const [isFetching, setIsFetching] = useState(true);
    const theme = useColorPalates();
    const [conversations, setConversations] = useState([]);
    const flags = useFlags(['show_chat_history_page']);
    const t = useLocalization();

    const config =useConfig('component','historyPage');
    const handleClick = useCallback((activeItem: HistoryItem) => {
        console.log({ activeItem });
    }, []);

    const onSecondaryActionClick = useCallback(
        (activeItem: ChatItem) => () => {
            if (window.confirm("Are you sure you want to delete this conversation?")) {
                setConversations(prev => {
                    return prev.filter((item: ChatItem) => item.conversationId !== activeItem.conversationId)
                })
            }
        },
        []
    );


    useEffect(() => {
        setIsFetching(true);
        axios
            .get(`${process.env.NEXT_PUBLIC_BFF_API_URL}/user/conversations/all`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem('auth')}`,
                },
            })
            .then((res) => {
                console.log({ res })
                const sortedConversations = _.filter(
                    res?.data,
                    (conv) => conv?.conversationId !== null
                ).sort(
                    //@ts-ignore
                    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                );
                console.log({ sortedConversations });
                const historyList = map(sortedConversations, (chatItem: ChatItem) => ({
                    id: chatItem?.id,
                    label: chatItem?.query,
                    conversationId: chatItem?.conversationId,
                    userId: chatItem?.userId,
                    secondaryLabel: moment(chatItem?.updatedAt).format("hh:mm A DD/MM/YYYY"),
                    icon: <ForumIcon style={{ color: theme?.primary?.light }} />,
                    secondaryAction: (
                        <IconButton
                            edge="end"
                            aria-label="comments"
                            onClick={onSecondaryActionClick(chatItem)}
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    ),
                    onClick: handleClick,
                    isDivider: true,
                }));
                //@ts-ignore
                setConversations(historyList);
                setIsFetching(false);
            })
            .catch((error) => {
                console.error(error);
                setIsFetching(false);
            });
    }, []);



    if (!flags?.show_chat_history_page?.enabled) {
        return <ComingSoonPage />;
    }
    return (
        <>
            <div className={styles.main}>
                <FullPageLoader loading={isFetching} color={theme?.primary?.main} label="Fetching History" />
                <div className={styles.title} style={{ color: theme?.primary?.main }}>
                    {component?.title ?? "No Label Provided"}
                </div>
                <div className={styles.chatList}>
                    <List items={conversations} noItem={{ label: config?.noItemsText ?? "No History Found", icon: <ForumIcon style={{ color: theme?.primary?.light }} /> }} />
                </div>
            </div>
        </>
    );
};

export default HistoryPage;
