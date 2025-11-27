import React, { useEffect, useState } from "react";
import { Tabs, message, Row, Col } from "antd";
import axios from "axios";

import SearchBar from "./SearchBar";
import PhotoGallery from "./PhotoGallery";
import CreatePostButton from "./CreatePostButton";
import { SEARCH_KEY, BASE_URL, TOKEN_KEY } from "../constants";

import "../styles/Collection.css";

const { TabPane } = Tabs;

function Collection(props) {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("images");

  const [searchOptions, setSearchOptions] = useState({
    type: SEARCH_KEY.all,
    keyword: "",
  });

  const handleSearch = (options) => {
    setSearchOptions(options);
  };

  useEffect(() => {
    fetchPosts(searchOptions);
  }, [searchOptions]);

  const fetchPosts = (option) => {
    const { type, keyword } = option;
    let url = "";

    if (type === SEARCH_KEY.all) {
      url = `${BASE_URL}/search`;
    } else if (type === SEARCH_KEY.user) {
      url = `${BASE_URL}/search?user=${keyword}`;
    } else {
      url = `${BASE_URL}/search?keywords=${keyword}`;
    }

    const opt = {
      method: "GET",
      url: url,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
      },
    };
    axios(opt)
      .then((res) => {
        if (res.status === 200) {
          setPosts(res.data);
        }
      })
      .catch((err) => {
        message.error("Fetch posts failed!");
      });
  };

  const renderPosts = (type) => {
    if (!posts || posts.length === 0) {
      return <div>No posts found.</div>;
    }
    let filtered;
    if (type === "images") {
      filtered = posts.filter((post) => post.type === "image");
      console.log(filtered);
      if (!filtered || filtered.length === 0) {
        return <div>No image posts found.</div>;
      }
      const imageArr = filtered.map((image) => {
        return {
          postId: image.id,
          src: image.url,
          user: image.user,
          caption: image.message,
          thumbnail: image.url,
          thumbnailWidth: 300,
          thumbnailHeight: 200,
        };
      });
      return <PhotoGallery images={imageArr} />;
    } else if (type === "videos") {
      filtered = posts.filter((post) => post.type === "video");
      if (!filtered || filtered.length === 0) {
        return <div>No video posts found.</div>;
      }
      return (
        <Row>
          {filtered.map((post) => (
            <Col span={24} key={post.url}>
              <video src={post.url} controls={true} className="video-block" />
            </Col>
          ))}
        </Row>
      );
    }
  };

  const showPost = (type) => {
    setActiveTab(type);
    setTimeout(() => {
      setSearchOptions({ type: SEARCH_KEY.all, keyword: "" });
    }, 3000);
  };

  const operations = <CreatePostButton onShowPost={showPost} />;

  return (
    <div className="home">
      <SearchBar handleSearch={handleSearch} />
      <div className="display">
        <Tabs
          onChange={(key) => {
            setActiveTab(key);
          }}
          defaultActiveKey="image"
          activeKey={activeTab}
          tabBarExtraContent={operations}
        >
          <TabPane tab="Images" key="images">
            {renderPosts("images")}
          </TabPane>
          <TabPane tab="Videos" key="videos">
            {renderPosts("videos")}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default Collection;
