"use client";
import { ReloadIcon } from "@radix-ui/react-icons"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { fal } from "@fal-ai/client";

// Supabase client (client-side)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

fal.config({
    credentials: process.env.NEXT_PUBLIC_FAL_API_KEY,
});

// Resmi Supabase bucket'a yükleme fonksiyonu
const uploadImageToSupabase = async (fileUrl: string, userId: string) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const fileName = `${new Date().getTime()}.png`;
    const folderPath = `${userId}/`; // Kullanıcının id'siyle bir klasör oluşturuyoruz

    const { error } = await supabase.storage
        .from("photos") // Bucket adı
        .upload(`${folderPath}${fileName}`, blob, {
            contentType: "image/png",
        });

    if (error) {
        console.error("Error uploading image:", error.message);
        return null;
    }

    // Yüklenen görselin public URL'sini döndür
    const { data } = supabase.storage.from("photos").getPublicUrl(`${folderPath}${fileName}`);

    return data.publicUrl;
};

const ImageCreate = ({ user }: { user: any }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();



        fetchImage();
        setPrompt(""); //prompt inputunu temizler
        setImageUploaded(false);
        setIsSubmitLoading(true);
    };

    const handleSaveImage = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!user) {
            alert("Please sign in to save the image.");
            return;
        }
        setIsSaveLoading(true);
        const uploadedImageUrl = await uploadImageToSupabase(imageUrl!, user.id);

        if (uploadedImageUrl) {
            alert("Image saved successfully!");
            setIsSaveLoading(false);
        }
    };


    const fetchImage = async () => {
        setIsSubmitLoading(true);
        try {
            const result = await fal.subscribe("fal-ai/fast-sdxl", {
                input: { prompt: prompt },
            });

            const imageUrlFromResult = result.data.images[0].url;
            setImageUrl(imageUrlFromResult);
            setImageUploaded(true);
        } catch (error) {
            console.error("Error fetching image:", error);
        } finally {
            setIsSubmitLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-normal">Create Image</h2>
            <p>Image created count : 0</p>
            <div className="flex justify-center items-center bg-accent p-4 rounded shadow min-h-40">
                {imageUploaded && imageUrl ? (
                    <div className="mt-2 w-full">

                        <ScrollArea className=" w-full">
                            <div className="flex justify-center">
                                <Image src={imageUrl} alt="Generated image" width={300} height={300} className="rounded" />
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <p className="font-light">Your image will be shown here.</p>
                )}
            </div>

            <form className="flex flex-col gap-4 items-center min-w-64">
                <Input
                    type="text"
                    placeholder="Enter image prompt"
                    className="w-full p-2 border rounded"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <Button onClick={handleSubmit} className="w-full" type="submit" disabled={isSubmitLoading || prompt.trim() === ""}>
                    {isSubmitLoading ? "Creating..." : "Submit"}
                </Button>

                {imageUploaded && (
                    <Button type="button" onClick={handleSaveImage}>
                        {isSaveLoading ? (
                            <>
                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : "Save Image"}
                    </Button>
                )}
            </form>


        </div>
    );
};

export default ImageCreate;
