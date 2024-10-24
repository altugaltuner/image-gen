export const signUpAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const supabase = createClient();

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    // Kullanıcıyı doğrudan kaydet
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error(error.code + " " + error.message);
        return encodedRedirect("error", "/sign-up", error.message);
    }

    // Doğrudan oturum aç
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error(signInError.code + " " + signInError.message);
        return encodedRedirect("error", "/sign-in", signInError.message);
    }

    // Kayıttan sonra yönlendir
    return redirect("/protected");
};
