async function testLogin() {
    try {
        console.log('Testing login with admin@example.com / admin123...');
        const response = await fetch('http://localhost:3000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Login Success:', data);
        } else {
            console.error('Login Failed:', response.status, data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();
