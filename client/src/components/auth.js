export function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

export function getAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return { token, user: user ? JSON.parse(user) : null };
}

export function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function isAuthenticated() {
    const { token } = getAuth();
    return !!token;
}

export function hasRole(role) {
    const { user } = getAuth();
    return user && user.role === role;
}
