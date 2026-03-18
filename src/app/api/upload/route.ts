import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const symbol = formData.get("symbol") as string;
    const description = formData.get("description") as string;
    const website = (formData.get("website") as string) || "";
    const twitter = (formData.get("twitter") as string) || "";
    const telegram = (formData.get("telegram") as string) || "";

    if (!file || !name || !symbol || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    
    if (!pinataJwt) {
      console.warn("No PINATA_JWT provided. Using a default dummy URI for testing.");
      return NextResponse.json({ 
        metadataUri: "https://gateway.pinata.cloud/ipfs/QmZNW7fN5K9C86a2Z8bEFTVzH9j8pA4m3QYtqT1L3N4J2o",
        imageGatewayUri: "https://gateway.pinata.cloud/ipfs/QmZNW7fN5K9C86a2Z8bEFTVzH9j8pA4m3QYtqT1L3N4J2o"
      });
    }

    // 1. Upload Image
    const imageFormData = new FormData();
    imageFormData.append("file", file);
    
    // Add Metadata to Pinata dashboard for organization
    const pinataMetadata = JSON.stringify({
      name: `Image for ${name}`
    });
    imageFormData.append("pinataMetadata", pinataMetadata);

    const imageRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: imageFormData as any,
    });

    if (!imageRes.ok) {
      throw new Error(`Failed to upload image to Pinata: ${await imageRes.text()}`);
    }

    const imageData = await imageRes.json();
    const imageUri = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

    // 2. Upload JSON Metadata
    const jsonMetadata: any = {
      name,
      symbol,
      description,
      image: `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`,
      seller_fee_basis_points: 0,
      attributes: [],
      properties: {
        files: [
          {
            uri: `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`,
            type: file.type,
          },
        ],
        category: "image",
      },
    };

    if (website || twitter || telegram) {
      jsonMetadata.extensions = {};
      if (website) jsonMetadata.extensions.website = website;
      if (twitter) jsonMetadata.extensions.twitter = twitter;
      if (telegram) jsonMetadata.extensions.telegram = telegram;
    }

    const jsonRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: JSON.stringify({
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name: `${name} Metadata` },
        pinataContent: jsonMetadata,
      }),
    });

    if (!jsonRes.ok) {
      throw new Error("Failed to upload JSON metadata to Pinata");
    }

    const resultData = await jsonRes.json();
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${resultData.IpfsHash}`;

    return NextResponse.json({ 
      metadataUri, 
      gatewayUri: metadataUri,
      imageGatewayUri: `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
