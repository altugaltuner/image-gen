"use client";
import { ReloadIcon } from "@radix-ui/react-icons"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { fal } from "@fal-ai/client";
import supabase from "@/app/api/supabase";

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
    const [newImageCount, setNewImageCount] = useState(null);

    useEffect(() => {
        // Kullanıcının mevcut image_count değerini çek ve güncelle
        const fetchInitialCount = async () => {
            if (user) {
                const count = await getCountData();
                if (count !== null) {
                    setNewImageCount(count);
                }
            }
        };

        fetchInitialCount();
    }, [user]); // Sadece kullanıcı değiştiğinde tetiklenir

    const getCountData = async () => {
        if (!user) {
            return null;
        }
        // Kullanıcının mevcut image_count değerini çek
        const { data, error } = await supabase
            .from("profiles")
            .select("image_count")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Error fetching image_count:", error.message);
            return null;
        }

        // Mevcut image_count değerini döndür
        return data?.image_count || 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //user yoksa girişe yönlendir
        if (!user) {
            alert("Please sign in to create an image.");
            return;
        }

        // image_count değerini getCountData fonksiyonundan al
        const currentImageCount = await getCountData();

        //5 ve üzeri kullanımda daha fazla üretmenin önüne geç
        if (currentImageCount >= 5) {
            alert("You have reached the maximum number of images you can create.");
            return;
        }
        setIsSubmitLoading(true);

        try {
            // Görsel oluşturma işlemi, await ile bitene kadar bekler
            await fetchImage();

            // Yeni image_count değerini hesapla
            const newImageCount = currentImageCount + 1;
            setNewImageCount(newImageCount);

            // Supabase'de image_count'u güncelle
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ image_count: newImageCount })
                .eq("id", user.id);

            if (updateError) {
                console.error("Error updating image_count:", updateError.message);
            } else {
                console.log("Image count updated successfully!");
            }

        } catch (error) {
            console.error("Error in handleSubmit:", error);
        } finally {
            setPrompt("");
            setIsSubmitLoading(false);
        }
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
            <p>Image created count : {newImageCount}</p>
            <div className="flex justify-center items-center bg-accent p-4 rounded shadow min-h-64 min-w-[350px]">
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
