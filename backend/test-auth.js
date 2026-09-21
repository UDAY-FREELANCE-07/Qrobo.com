const testAuth = async () => {
  let cookie = '';
  
  const printResponse = async (name, res) => {
    const text = await res.text();
    console.log(`\n=== ${name} ===`);
    console.log(`Status: ${res.status}`);
    try {
      console.log('Body:', JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      console.log('Body:', text);
    }
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      console.log('Set-Cookie:', setCookie);
      // extremely hacky way to extract tokens
      const accMatch = setCookie.match(/accessToken=([^;]+)/);
      const refMatch = setCookie.match(/refreshToken=([^;]+)/);
      if (accMatch) cookie = `accessToken=${accMatch[1]}; ${cookie}`;
      if (refMatch) cookie = `refreshToken=${refMatch[1]}; ${cookie}`;
    }
  };

  try {
    // 1. Signup
    const resSignup = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' })
    });
    await printResponse('SIGNUP', resSignup);

    // 2. Duplicate Signup
    const resSignup2 = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' })
    });
    await printResponse('DUPLICATE SIGNUP', resSignup2);

    // 3. Invalid Login
    const resSigninInvalid = await fetch('http://localhost:5000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
    });
    await printResponse('INVALID LOGIN', resSigninInvalid);

    // 4. Signin
    const resSignin = await fetch('http://localhost:5000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    await printResponse('SIGNIN', resSignin);

    // 5. Get Me (Protected)
    const resMe = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: { 'Cookie': cookie }
    });
    await printResponse('GET ME', resMe);

    // 6. Admin Route (CUSTOMER role)
    const resAdmin = await fetch('http://localhost:5000/api/auth/admin-only', {
      method: 'GET',
      headers: { 'Cookie': cookie }
    });
    await printResponse('ADMIN ROUTE AS CUSTOMER', resAdmin);

    // 7. Refresh
    const resRefresh = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Cookie': cookie }
    });
    await printResponse('REFRESH', resRefresh);

    // 8. Signout
    const resSignout = await fetch('http://localhost:5000/api/auth/signout', {
      method: 'POST',
      headers: { 'Cookie': cookie }
    });
    await printResponse('SIGNOUT', resSignout);

    // 9. Protected Route without cookie
    const resProtected = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET'
    });
    await printResponse('PROTECTED ROUTE WITHOUT COOKIE', resProtected);
    
  } catch (err) {
    console.error('Test failed:', err);
  }
};

testAuth();
