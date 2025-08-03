import appStyles from '~styles/App.module.css';
import styles from '~styles/Table.module.css';

import { useEffect, useState } from 'react';
import { GiFemale, GiMale } from 'react-icons/gi';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import { SetURLSearchParams } from 'react-router';
import StatusBadge from '~components/StatusBadge';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import { Pagination } from '~models/response';
import { RoleName } from '~models/role';
import { UserDetail } from '~models/user';
import css from '~utils/css';
import languageUtils from '~utils/language-utils';
import ViewUser from './ViewUser';
import {Card, Switch} from "antd";

type UsersTableProps = {
    role: RoleName;
    data?: Pagination<UserDetail>;
    searchParams: URLSearchParams;
    onMutateSuccess: () => void;
    setSearchParams: SetURLSearchParams;
    setSelectedRows: React.Dispatch<React.SetStateAction<Set<string | number>>>;
};
export default function UsersTable({
    role,
    data,
    searchParams,
    onMutateSuccess,
    setSearchParams,
    setSelectedRows
}: UsersTableProps) {
    const { permissions } = useAppContext();
    const language = useLanguage('component.users_table');
    const [showViewPopUp, setShowViewPopUp] = useState(false);
    const [checkAll, setCheckAll] = useState(false);
    const [userId, setUserId] = useState<number>(0);
    const handleViewUser = (id: number, e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        const target = e.target as Element;
        if (target.nodeName === 'INPUT') {
            const checkBox = target as HTMLInputElement;
            const perPage = Number(searchParams.get('per_page')) || 10;
            if (checkBox.checked) setSelectedRows(pre => {
                pre.add(id);
                if (pre.size === perPage) setCheckAll(true);
                return structuredClone(pre);
            });
            else setSelectedRows(pre => {
                pre.delete(id);
                if (pre.size !== perPage) setCheckAll(false);
                return structuredClone(pre);
            });
            return;
        }
        setUserId(id);
        setShowViewPopUp(true);
    };
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentTarget = e.currentTarget;
        const selector = `.${styles.columnSelect}>input`;
        const allCheckBox = document.querySelectorAll(selector);
        allCheckBox.forEach(node => {
            const element = node as HTMLInputElement;
            element.checked = currentTarget.checked;
        });
        if (currentTarget.checked) {
            setSelectedRows(pre => {
                pre.clear();
                if (data) data.data.forEach(user => {
                    pre.add(user.id);
                });
                return structuredClone(pre);
            });
            setCheckAll(true);
        }
        else {
            setSelectedRows(pre => {
                pre.clear();
                return structuredClone(pre);
            });
            setCheckAll(false);
        }
    };
    useEffect(() => {
        setCheckAll(false);
    }, [data]);
    return (
        <>
            {showViewPopUp === true ?
                <ViewUser
                    id={userId}
                    onMutateSuccess={onMutateSuccess}
                    setShowPopUp={setShowViewPopUp}
                /> : null}

            <Card className="h-full w-full overflow-scroll">
                <div className="overflow-x-auto rounded border border-gray-300 shadow-sm">
                    <table className="min-w-full divide-y-2 divide-gray-200">
                        <thead className="ltr:text-left rtl:text-right">
                        <tr className="*:font-medium *:text-gray-900">
                            {
                                permissions.has('user_delete') ?
                                    <th className="px-3 py-2 whitespace-nowrap">
                                        <input type='checkbox'
                                               checked={checkAll}
                                               onChange={handleSelectAll} />
                                    </th>
                                    : null
                            }
                            <th className="px-3 py-2 whitespace-nowrap">{language?.header.shortcode}</th>
                            <th className="px-3 py-2 whitespace-nowrap">{language?.header.name}</th>
                            {/*<th className="px-3 py-2 whitespace-nowrap">*/}
                            {/*    {role === 'student' ? language?.header.class : language?.header.faculty}*/}
                            {/*</th>*/}
                            <th className="px-3 py-2 whitespace-nowrap">{language?.header.email}</th>
                            <th className="px-3 py-2 whitespace-nowrap">{language?.header.address}</th>
                            <th className="px-3 py-2 whitespace-nowrap">{language?.header.status}</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                        {
                            data?.data?.map(user => {
                                return (
                                    <tr key={user.id}
                                        className="*:text-gray-900 *:first:font-medium"
                                        onClick={(e) => {
                                            handleViewUser(user.id, e);
                                        }}>
                                        {
                                            permissions.has('user_delete') ?
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <input type='checkbox' />
                                                </td>
                                            : null
                                        }
                                        <td className="px-3 py-2 whitespace-nowrap">{user.shortcode}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {user.gender == 'male' ? <GiMale /> : <GiFemale />}
                                            {languageUtils.getFullName(user.firstName, user.lastName)}
                                        </td>
                                        {/*<td className="px-3 py-2 whitespace-nowrap">*/}
                                        {/*    {role === 'student' ? user.schoolClass?.name : user.faculty?.name}*/}
                                        {/*</td>*/}
                                        <td className="px-3 py-2 whitespace-nowrap">{user.email}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{user.address}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <Switch checked={user.isActive}/>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
                <div className={styles.tableContent}>
                    {
                        data ?
                            <div className={styles.tableFooter}>
                            <span>
                                {data.from} - {data.to} / {data.total}
                            </span>
                                <div className={styles.tableLinks}>
                                    {
                                        <div className={styles.linkContent}>
                                            {data.links.map(link => {
                                                if (isNaN(Number(link.label))) return (
                                                    <button key={role + link.label}
                                                            className={styles.nextPrevious}
                                                            onClick={() => {
                                                                if (!link.url) return;
                                                                const url = new URL(link.url);
                                                                searchParams.set('page', url.searchParams.get('page') || '1');
                                                                setSearchParams(searchParams);
                                                            }}
                                                    >
                                                        {link.label === '...' ? '...' : link.label.includes('Next') ? <GrFormNext /> : <GrFormPrevious />}
                                                    </button>
                                                );
                                                return (
                                                    <button key={role + link.label} className={
                                                        css(
                                                            appStyles.button,
                                                            !link.active ? styles.inactive : ''
                                                        )
                                                    }
                                                            onClick={() => {
                                                                if (!link.url) return;
                                                                const url = new URL(link.url);
                                                                searchParams.set('page', url.searchParams.get('page') || '1');
                                                                setSearchParams(searchParams);
                                                            }}
                                                    >{link.label}</button>
                                                );
                                            })}
                                        </div>
                                    }
                                </div>
                            </div> : null
                    }
                </div>
            </Card>
        </>
    );
}
