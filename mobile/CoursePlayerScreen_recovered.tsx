        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  useEffect(() => {
    if (data?.lesson?.type === 'YOUTUBE' && data?.lesson?.youtubeVideoId) {
      // Point directly to our new streaming proxy endpoint
      setProxyUrl(`http://${localIp}:8080/play?id=${data.lesson.youtubeVideoId}`);
    }
  }, [data?.lesson?.youtubeVideoId, data?.lesson?.type]);
