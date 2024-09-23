import React from 'react';
import { useLogin, useLogout, useIsAuthenticated, useGetIdentity } from '@refinedev/core';

interface User {
    name: string;
    groups: string[];
}

const Authentication: React.FC = () => {
    const { mutate: login } = useLogin();
    const { mutate: logout } = useLogout();
    const { data: user, isLoading } = useGetIdentity<User>();
    const isAuthenticated = useIsAuthenticated();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <button onClick={() => login({ redirectPath: '/' })}>Login</button>;
    }

    return (
        //TODO: Go to FERN UI homepage instead of the div below
        <div>
            <h2>Welcome, {user?.name}</h2>
            <p>Groups: {user?.groups?.join(', ')}</p>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

export default Authentication;
