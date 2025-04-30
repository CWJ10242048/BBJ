module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot后端端口
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' }
      }
    }
  }
} 